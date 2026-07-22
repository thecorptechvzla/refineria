'use client';

import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef, type ReactNode } from 'react';

/* ───── Stored Types (raw data, no computed fields) ───── */

export interface CriticoQuimico {
  id: string;
  name: string;
  unit: string;
  initialStock: number;
  ajuste: number;
  dailyConsumption: number;
  minimum: number;
  history: { date: string; v: number }[];
}

export interface CriticoGas {
  id: string;
  name: string;
  full: number;
  inUse: number;
  available: number;
}

export interface ConsumoHistorialEntry {
  id: string;
  date: string;
  insumo: string;
  cantidad: number;
  tipo: 'CARGO' | 'DESCARGO';
  observacion: string;
}

export interface Novedad {
  id: string;
  equipo: string;
  diagnostico: string;
  accion: string;
}

/* ───── Computed Types (derived from raw data) ───── */

export interface QuimicoComputed extends CriticoQuimico {
  currentStock: number;
  daysOfAutonomy: number | null;
}

export interface CombustibleLogEntry {
  date: string;
  consumption: number;
  remaining: number;
}

export interface CombustibleData {
  initialAmount: number;
  currentStock: number;
  log: CombustibleLogEntry[];
}

/* ───── State Shape ───── */

interface CriticosState {
  quimicos: CriticoQuimico[];
  gases: CriticoGas[];
  combustible: {
    initialAmount: number;
    log: { date: string; consumption: number }[];
  };
  historial: ConsumoHistorialEntry[];
  novedades: Novedad[];
}

export interface CriticoRegistration {
  name: string;
  criticalType: 'QUIMICO' | 'GAS' | 'COMBUSTIBLE';
  unit?: string;
  initialStock?: number;
  dailyConsumption?: number;
  minimum?: number;
  cilindrosLlenos?: number;
  cilindrosEnUso?: number;
  cilindrosDisponibles?: number;
  litrosIniciales?: number;
  capacidadTanque?: number;
}

interface CriticosContextValue {
  quimicos: QuimicoComputed[];
  gases: CriticoGas[];
  combustible: CombustibleData;
  historial: ConsumoHistorialEntry[];
  novedades: Novedad[];
  registerDescargo: (itemName: string, quantity: number, reference: string) => void;
  registerCargo: (itemName: string, quantity: number, reference: string) => void;
  registerCritico: (data: CriticoRegistration) => void;
  addNovedad: (equipo: string, diagnostico: string, accion: string) => void;
}

/* ───── Helpers ───── */

function calcDays(stock: number, daily: number): number | null {
  const s = Number(stock) || 0;
  const d = Number(daily) || 0;
  if (d <= 0) return null;
  return s / d;
}

function computeQuimico(q: CriticoQuimico): QuimicoComputed {
  const initial = Number(q.initialStock) || 0;
  const ajuste = Number(q.ajuste) || 0;
  const totalConsumed = q.history.reduce((s, h) => s + (Number(h.v) || 0), 0);
  const currentStock = Math.max(0, initial + ajuste - totalConsumed);
  return {
    ...q,
    currentStock,
    daysOfAutonomy: calcDays(currentStock, Number(q.dailyConsumption) || 0),
  };
}

function computeCombustible(raw: CriticosState['combustible']): CombustibleData {
  const initialAmount = Number(raw.initialAmount) || 0;
  let running = initialAmount;
  const log: CombustibleLogEntry[] = raw.log.map((entry) => {
    const consumption = Number(entry.consumption) || 0;
    running -= consumption;
    return { date: entry.date, consumption, remaining: Math.max(0, running) };
  });
  return { initialAmount, currentStock: Math.max(0, running), log };
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function now(): string {
  return new Date().toLocaleString('es-PE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

/* ───── Default / Mock Initial State ───── */

function buildDefaultState(): CriticosState {
  return {
    quimicos: [],
    gases: [],
    combustible: { initialAmount: 0, log: [] },
    historial: [],
    novedades: [],
  };
}

const STORAGE_KEY = 'goldtrack_criticos_v2';

/* ───── Context ───── */

function loadInitialState(): CriticosState {
  if (typeof window === 'undefined') return buildDefaultState();
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as CriticosState;
      /* migrate old localStorage: ensure ajuste field exists on each quimico */
      if (parsed.quimicos) {
        parsed.quimicos = parsed.quimicos.map((q) => ({
          ...q,
          ajuste: Number(q.ajuste) || 0,
          initialStock: Number(q.initialStock) || 0,
          dailyConsumption: Number(q.dailyConsumption) || 0,
          minimum: Number(q.minimum) || 0,
          history: (q.history || []).map((h) => ({ date: h.date || '', v: Number(h.v) || 0 })),
        }));
      }
      if (parsed.combustible) {
        parsed.combustible.initialAmount = Number(parsed.combustible.initialAmount) || 0;
        parsed.combustible.log = (parsed.combustible.log || []).map((e) => ({
          date: e.date || '',
          consumption: Number(e.consumption) || 0,
        }));
      }
      return parsed;
    }
  } catch { /* ignore */ }
  return buildDefaultState();
}

/** Strip computed fields before persisting */
function stripDerived(state: CriticosState): CriticosState {
  return state;
}

const CriticosContext = createContext<CriticosContextValue | null>(null);

export function CriticosProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CriticosState>(loadInitialState);
  const persistedRef = useRef(false);

  /* ── Computed values ── */

  const quimicos = useMemo(() => state.quimicos.map(computeQuimico), [state.quimicos]);

  const combustible = useMemo(() => computeCombustible(state.combustible), [state.combustible]);

  /* Persist to localStorage on every change after first paint */
  useEffect(() => {
    if (!persistedRef.current) {
      persistedRef.current = true;
      return;
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stripDerived(state)));
    } catch { /* quota exceeded, silently ignore */ }
  }, [state]);

  const registerDescargo = useCallback((itemName: string, quantity: number, reference: string) => {
    setState((prev) => {
      const historialEntry: ConsumoHistorialEntry = {
        id: generateId(),
        date: now(),
        insumo: itemName,
        cantidad: quantity,
        tipo: 'DESCARGO',
        observacion: reference,
      };

      /* Try to match a químicos item */
      const qIdx = prev.quimicos.findIndex(
        (q) => q.name.toLowerCase().includes(itemName.toLowerCase()),
      );
      let updatedQuimicos = prev.quimicos;
      if (qIdx !== -1) {
        const q = prev.quimicos[qIdx];
        const updated: CriticoQuimico = {
          ...q,
          history: [...q.history, { date: now(), v: quantity }],
        };
        updatedQuimicos = [...prev.quimicos];
        updatedQuimicos[qIdx] = updated;
      }

      /* Try to match combustible (GASOIL / DIESEL / COMBUSTIBLE) */
      const fuelKeywords = ['gasoil', 'diesel', 'combustible', 'gasolina'];
      const isFuel = fuelKeywords.some((kw) => itemName.toLowerCase().includes(kw));
      let updatedCombustible = prev.combustible;
      if (isFuel) {
        updatedCombustible = {
          ...prev.combustible,
          log: [...prev.combustible.log, { date: now(), consumption: quantity }],
        };
      }

      return {
        ...prev,
        quimicos: updatedQuimicos,
        combustible: updatedCombustible,
        historial: [historialEntry, ...prev.historial],
      };
    });
  }, []);

  const registerCargo = useCallback((itemName: string, quantity: number, reference: string) => {
    setState((prev) => {
      const historialEntry: ConsumoHistorialEntry = {
        id: generateId(),
        date: now(),
        insumo: itemName,
        cantidad: quantity,
        tipo: 'CARGO',
        observacion: reference,
      };

      /* Try to match a químicos item: increase ajuste (positive = more stock) */
      const qIdx = prev.quimicos.findIndex(
        (q) => q.name.toLowerCase().includes(itemName.toLowerCase()),
      );
      let updatedQuimicos = prev.quimicos;
      if (qIdx !== -1) {
        const q = prev.quimicos[qIdx];
        const updated: CriticoQuimico = {
          ...q,
          ajuste: q.ajuste + quantity,
        };
        updatedQuimicos = [...prev.quimicos];
        updatedQuimicos[qIdx] = updated;
      }

      /* Try to match combustible (GASOIL / DIESEL / COMBUSTIBLE): add negative consumption = increase tank level */
      const fuelKeywords = ['gasoil', 'diesel', 'combustible', 'gasolina'];
      const isFuel = fuelKeywords.some((kw) => itemName.toLowerCase().includes(kw));
      let updatedCombustible = prev.combustible;
      if (isFuel) {
        updatedCombustible = {
          ...prev.combustible,
          log: [...prev.combustible.log, { date: now(), consumption: -quantity }],
        };
      }

      return {
        ...prev,
        quimicos: updatedQuimicos,
        combustible: updatedCombustible,
        historial: [historialEntry, ...prev.historial],
      };
    });
  }, []);

  const registerCritico = useCallback((data: CriticoRegistration) => {
    setState((prev) => {
      if (data.criticalType === 'QUIMICO') {
        const q: CriticoQuimico = {
          id: generateId(),
          name: data.name,
          unit: data.unit || 'Lts',
          initialStock: Number(data.initialStock) || 0,
          ajuste: 0,
          dailyConsumption: Number(data.dailyConsumption) || 0,
          minimum: Number(data.minimum) || 0,
          history: [],
        };
        return { ...prev, quimicos: [...prev.quimicos, q] };
      }

      if (data.criticalType === 'GAS') {
        const g: CriticoGas = {
          id: generateId(),
          name: data.name,
          full: Number(data.cilindrosLlenos) || 0,
          inUse: Number(data.cilindrosEnUso) || 0,
          available: Number(data.cilindrosDisponibles) || 0,
        };
        return { ...prev, gases: [...prev.gases, g] };
      }

      if (data.criticalType === 'COMBUSTIBLE') {
        const litros = Number(data.litrosIniciales) || 0;
        return {
          ...prev,
          combustible: { initialAmount: litros || prev.combustible.initialAmount, log: prev.combustible.log },
        };
      }

      return prev;
    });
  }, []);

  const addNovedad = useCallback((equipo: string, diagnostico: string, accion: string) => {
    setState((prev) => ({
      ...prev,
      novedades: [
        { id: generateId(), equipo, diagnostico, accion },
        ...prev.novedades,
      ],
    }));
  }, []);

  return (
    <CriticosContext.Provider value={{ quimicos, gases: state.gases, combustible, historial: state.historial, novedades: state.novedades, registerDescargo, registerCargo, registerCritico, addNovedad }}>
      {children}
    </CriticosContext.Provider>
  );
}

export function useCriticos(): CriticosContextValue {
  const ctx = useContext(CriticosContext);
  if (!ctx) throw new Error('useCriticos must be used within CriticosProvider');
  return ctx;
}
