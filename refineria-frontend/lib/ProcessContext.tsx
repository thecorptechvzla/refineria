'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { GoldBar, ProcessLot } from '@/types/refinery';

interface ProcessContextType {
  goldBars: GoldBar[];
  lots: ProcessLot[];
  addBar: (data: Omit<GoldBar, 'id' | 'disponible' | 'fechaRegistro'>) => void;
  assignToLot: (supplierId: string, barIds: string[]) => void;
}

const ProcessContext = createContext<ProcessContextType | null>(null);

const initialBars: GoldBar[] = [
  { id: 'b1', codigo: 'BAR-001', supplierId: 's1', pesoBruto: 3200, analitico: 3040.0, esperado: 3050.0, recuperado: 3035.5, disponible: true, fechaRegistro: '2025-05-20T10:00:00Z' },
  { id: 'b2', codigo: 'BAR-002', supplierId: 's1', pesoBruto: 1500, analitico: 1425.0, esperado: 1430.0, recuperado: 1422.0, disponible: true, fechaRegistro: '2025-05-21T11:30:00Z' },
  { id: 'b3', codigo: 'BAR-003', supplierId: 's1', pesoBruto: 4800, analitico: 4560.0, esperado: 4575.0, recuperado: 4552.0, disponible: true, fechaRegistro: '2025-05-22T09:15:00Z' },
  { id: 'b4', codigo: 'BAR-004', supplierId: 's2', pesoBruto: 2100, analitico: 1995.0, esperado: 2000.0, recuperado: 1992.0, disponible: true, fechaRegistro: '2025-05-23T14:00:00Z' },
  { id: 'b5', codigo: 'BAR-005', supplierId: 's2', pesoBruto: 3500, analitico: 3325.0, esperado: 3335.0, recuperado: 3320.0, disponible: true, fechaRegistro: '2025-05-24T08:45:00Z' },
  { id: 'b6', codigo: 'BAR-006', supplierId: 's3', pesoBruto: 1200, analitico: 1140.0, esperado: 1145.0, recuperado: 1138.0, disponible: true, fechaRegistro: '2025-05-25T10:30:00Z' },
  { id: 'b7', codigo: 'BAR-007', supplierId: 's3', pesoBruto: 4200, analitico: 3990.0, esperado: 4005.0, recuperado: 3985.0, disponible: true, fechaRegistro: '2025-05-26T11:00:00Z' },
  { id: 'b8', codigo: 'BAR-008', supplierId: 's3', pesoBruto: 2800, analitico: 2660.0, esperado: 2670.0, recuperado: 2655.0, disponible: true, fechaRegistro: '2025-05-27T09:30:00Z' },
  { id: 'b9', codigo: 'BAR-009', supplierId: 's4', pesoBruto: 1800, analitico: 1710.0, esperado: 1715.0, recuperado: 1707.0, disponible: true, fechaRegistro: '2025-05-28T13:15:00Z' },
  { id: 'b10', codigo: 'BAR-010', supplierId: 's4', pesoBruto: 2500, analitico: 2375.0, esperado: 2383.0, recuperado: 2370.0, disponible: true, fechaRegistro: '2025-05-29T15:00:00Z' },
];

export function ProcessProvider({ children }: { children: ReactNode }) {
  const [goldBars, setGoldBars] = useState<GoldBar[]>(initialBars);
  const [lots, setLots] = useState<ProcessLot[]>([]);

  const addBar = useCallback((data: Omit<GoldBar, 'id' | 'disponible' | 'fechaRegistro'>) => {
    const newBar: GoldBar = {
      ...data,
      id: `b${Date.now()}`,
      disponible: true,
      fechaRegistro: new Date().toISOString(),
    };
    setGoldBars((prev) => [...prev, newBar]);
  }, []);

  const assignToLot = useCallback((supplierId: string, barIds: string[]) => {
    setLots((prev) => {
      const nextNum = prev.length + 1;
      const newLot: ProcessLot = {
        id: `lot${Date.now()}`,
        numero: nextNum,
        supplierId,
        barIds,
        fechaCreacion: new Date().toISOString(),
      };
      return [...prev, newLot];
    });
    setGoldBars((prev) =>
      prev.map((bar) =>
        barIds.includes(bar.id) ? { ...bar, disponible: false } : bar
      )
    );
  }, []);

  return (
    <ProcessContext.Provider value={{ goldBars, lots, addBar, assignToLot }}>
      {children}
    </ProcessContext.Provider>
  );
}

export function useProcess(): ProcessContextType {
  const ctx = useContext(ProcessContext);
  if (!ctx) throw new Error('useProcess debe usarse dentro de un ProcessProvider');
  return ctx;
}
