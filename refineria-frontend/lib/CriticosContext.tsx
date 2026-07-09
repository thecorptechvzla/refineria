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
    quimicos: [
      { id: '1', name: 'Ácido Clorhídrico', unit: 'Lts', initialStock: 6235, ajuste: 499, dailyConsumption: 216, minimum: 860, history: [
        { date: '28/05', v: 216 }, { date: '29/05', v: 216 }, { date: '30/05', v: 216 }, { date: '31/05', v: 216 },
        { date: '01/06', v: 216 }, { date: '02/06', v: 216 }, { date: '03/06', v: 216 }, { date: '04/06', v: 216 },
        { date: '05/06', v: 216 }, { date: '06/06', v: 216 }, { date: '07/06', v: 216 }, { date: '08/06', v: 216 },
        { date: '09/06', v: 216 }, { date: '10/06', v: 216 }, { date: '11/06', v: 216 }, { date: '12/06', v: 216 },
        { date: '13/06', v: 216 }, { date: '14/06', v: 216 }, { date: '15/06', v: 216 }, { date: '16/06', v: 216 },
        { date: '17/06', v: 216 }, { date: '18/06', v: 216 }, { date: '19/06', v: 216 },
        { date: '20/06', v: 216 }, { date: '21/06', v: 216 }, { date: '22/06', v: 216 }, { date: '23/06', v: 216 },
      ]},
      { id: '2', name: 'Ácido Nítrico', unit: 'Lts', initialStock: 3510, ajuste: -380, dailyConsumption: 120, minimum: 500, history: [
        { date: '28/05', v: 120 }, { date: '29/05', v: 102 }, { date: '30/05', v: 102 }, { date: '31/05', v: 102 },
        { date: '01/06', v: 102 }, { date: '02/06', v: 72 }, { date: '03/06', v: 72 }, { date: '04/06', v: 72 },
        { date: '05/06', v: 72 }, { date: '06/06', v: 72 }, { date: '07/06', v: 72 }, { date: '08/06', v: 72 },
        { date: '09/06', v: 72 }, { date: '10/06', v: 72 }, { date: '11/06', v: 72 }, { date: '12/06', v: 72 },
        { date: '13/06', v: 72 }, { date: '14/06', v: 72 }, { date: '15/06', v: 72 }, { date: '16/06', v: 72 },
        { date: '17/06', v: 72 }, { date: '18/06', v: 72 }, { date: '19/06', v: 72 }, { date: '20/06', v: 72 },
        { date: '21/06', v: 72 }, { date: '22/06', v: 72 }, { date: '23/06', v: 72 },
      ]},
      { id: '3', name: 'Metabisulfito', unit: 'kg', initialStock: 1625, ajuste: 2883, dailyConsumption: 75, minimum: 300, history: [
        { date: '28/05', v: 75 }, { date: '29/05', v: 75 }, { date: '30/05', v: 74 }, { date: '31/05', v: 75 },
        { date: '01/06', v: 72 }, { date: '02/06', v: 72 }, { date: '03/06', v: 72 }, { date: '04/06', v: 72 },
        { date: '05/06', v: 72 }, { date: '06/06', v: 72 }, { date: '07/06', v: 72 }, { date: '08/06', v: 72 },
        { date: '09/06', v: 72 }, { date: '10/06', v: 72 }, { date: '11/06', v: 72 }, { date: '12/06', v: 72 },
        { date: '13/06', v: 72 }, { date: '14/06', v: 72 }, { date: '15/06', v: 72 }, { date: '16/06', v: 72 },
        { date: '17/06', v: 72 }, { date: '18/06', v: 72 }, { date: '19/06', v: 72 }, { date: '20/06', v: 72 },
        { date: '21/06', v: 72 }, { date: '22/06', v: 72 }, { date: '23/06', v: 72 },
      ]},
      { id: '4', name: 'Urea', unit: 'kg', initialStock: 5900, ajuste: 40, dailyConsumption: 72, minimum: 600, history: [
        { date: '28/05', v: 70 }, { date: '29/05', v: 72 }, { date: '30/05', v: 72 }, { date: '31/05', v: 72 },
        { date: '01/06', v: 72 }, { date: '02/06', v: 72 }, { date: '03/06', v: 72 }, { date: '04/06', v: 72 },
        { date: '05/06', v: 72 }, { date: '06/06', v: 72 }, { date: '07/06', v: 42 }, { date: '08/06', v: 72 },
        { date: '09/06', v: 72 }, { date: '10/06', v: 72 }, { date: '11/06', v: 72 }, { date: '12/06', v: 72 },
        { date: '13/06', v: 72 }, { date: '14/06', v: 72 }, { date: '15/06', v: 72 }, { date: '16/06', v: 72 },
        { date: '17/06', v: 72 }, { date: '18/06', v: 72 }, { date: '19/06', v: 72 }, { date: '20/06', v: 72 },
        { date: '21/06', v: 72 }, { date: '22/06', v: 72 }, { date: '23/06', v: 72 },
      ]},
      { id: '5', name: 'Soda Caustica (Lts)', unit: 'Lts', initialStock: 350, ajuste: 0, dailyConsumption: 0, minimum: 120, history: [] },
      { id: '6', name: 'Soda Caustica (Kg)', unit: 'Kg', initialStock: 1800, ajuste: 4, dailyConsumption: 0, minimum: 250, history: [] },
      { id: '7', name: 'Amoniaco', unit: 'Lts', initialStock: 1880, ajuste: 74, dailyConsumption: 60, minimum: 500, history: [
        { date: '28/05', v: 60 }, { date: '29/05', v: 60 }, { date: '30/05', v: 54 }, { date: '31/05', v: 60 },
        { date: '01/06', v: 60 }, { date: '02/06', v: 60 }, { date: '03/06', v: 60 }, { date: '04/06', v: 60 },
        { date: '05/06', v: 60 }, { date: '06/06', v: 60 }, { date: '07/06', v: 60 }, { date: '08/06', v: 60 },
        { date: '09/06', v: 60 }, { date: '10/06', v: 60 }, { date: '11/06', v: 60 }, { date: '12/06', v: 60 },
        { date: '13/06', v: 60 }, { date: '14/06', v: 60 }, { date: '15/06', v: 60 }, { date: '16/06', v: 60 },
        { date: '17/06', v: 60 }, { date: '18/06', v: 60 }, { date: '19/06', v: 60 }, { date: '20/06', v: 60 },
        { date: '21/06', v: 60 }, { date: '22/06', v: 60 }, { date: '23/06', v: 60 },
      ]},
      { id: '8', name: 'Alcohol Etilico', unit: 'Lts', initialStock: 190, ajuste: -70, dailyConsumption: 4, minimum: 40, history: [
        { date: '28/05', v: 4 }, { date: '29/05', v: 0 }, { date: '30/05', v: 4 }, { date: '31/05', v: 0 },
        { date: '01/06', v: 4 }, { date: '02/06', v: 0 }, { date: '03/06', v: 0 }, { date: '04/06', v: 20 },
        { date: '09/06', v: 8 },
      ]},
    ],
    gases: [
      { id: '1', name: 'Propano', full: 1, inUse: 2, available: 1 },
      { id: '2', name: 'Oxígeno', full: 0, inUse: 1, available: 7 },
      { id: '3', name: 'Argón', full: 0, inUse: 1, available: 4 },
    ],
    combustible: {
      initialAmount: 21449,
      log: [
        { date: '01/06/26', consumption: 3000 },
        { date: '02/06/26', consumption: 473 },
        { date: '05/06/26', consumption: 2050 },
        { date: '08/06/26', consumption: 2046 },
        { date: '13/06/26', consumption: 1000 },
        { date: '15/06/26', consumption: 1000 },
        { date: '19/06/26', consumption: 3813 },
        { date: '21/06/26', consumption: 1000 },
        { date: '23/06/26', consumption: 2000 },
      ],
    },
    historial: [],
    novedades: [
      { id: '1', equipo: 'Generador del campamento', diagnostico: 'No encendía, se reemplazó el módulo EIM, queda corregida la falla. El radiador está totalmente tapado con peluza (se debe lavar externamente). La velocidad del motor no es estable, la bomba de inyección requiere servicio. Ruido irregular en el motor (será necesario desmontar la cámara para evaluar).', accion: 'Ya está en manos de Nelson desde el sábado 20/06/2026.' },
      { id: '2', equipo: 'Extractor', diagnostico: 'Persisten las rupturas de correas por falla en diseño de poleas.', accion: 'En espera de que baje equipo de Contreras para corregir falla.' },
      { id: '3', equipo: 'Horno azul grande', diagnostico: 'Presenta falla en la bobina. Al parecer no es 100% cobre — las tuberías que están vendiendo tienen aleación y eso afecta la inducción.', accion: 'Hoy terminaron de entregar la otra bobina.' },
      { id: '4', equipo: 'Casting bar', diagnostico: 'Presenta goteo interno (sudoración en las paredes). No se pudo hacer prueba por falla en el generador grande por el sensor de presión de aceite y que estaban en uso los hornos por fundición.', accion: 'Pendiente de reprogramar prueba.' },
    ],
  };
}

const STORAGE_KEY = 'goldtrack_criticos';

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

      return {
        ...prev,
        quimicos: updatedQuimicos,
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
