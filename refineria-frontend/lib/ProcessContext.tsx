'use client';

import { createContext, useContext, useCallback, type ReactNode } from 'react';
import type { GoldBar, Process, ProcessLot } from '@/types/refinery';
import { useGoldBars, useCreateGoldBar } from '@/lib/hooks/useGoldBars';
import { useProcesses, useCreateProcess, useCloseProcess, useAddLot } from '@/lib/hooks/useProcesses';

interface ProcessContextType {
  goldBars: GoldBar[];
  processes: Process[];
  isLoadingBars: boolean;
  isLoadingProcesses: boolean;
  addBar: (data: Omit<GoldBar, 'id' | 'available' | 'registrationDate'>) => Promise<GoldBar>;
  openProcess: (supplierId: string) => Promise<Process>;
  closeProcess: (processId: string) => Promise<Process>;
  assignToLot: (processId: string, barIds: string[]) => Promise<ProcessLot>;
}

const ProcessContext = createContext<ProcessContextType | null>(null);

export function ProcessProvider({ children }: { children: ReactNode }) {
  const { data: goldBars = [], isLoading: isLoadingBars } = useGoldBars();
  const { data: processes = [], isLoading: isLoadingProcesses } = useProcesses();

  const createGoldBar = useCreateGoldBar();
  const createProcess = useCreateProcess();
  const closeProcessMutation = useCloseProcess();
  const addLotMutation = useAddLot();

  const addBar = useCallback(
    async (data: Omit<GoldBar, 'id' | 'available' | 'registrationDate'>) => {
      return createGoldBar.mutateAsync(data);
    },
    [createGoldBar]
  );

  const openProcess = useCallback(
    async (supplierId: string) => {
      return createProcess.mutateAsync(supplierId);
    },
    [createProcess]
  );

  const closeProcess = useCallback(
    async (processId: string) => {
      return closeProcessMutation.mutateAsync(processId);
    },
    [closeProcessMutation]
  );

  const assignToLot = useCallback(
    async (processId: string, barIds: string[]) => {
      return addLotMutation.mutateAsync({ processId, barIds });
    },
    [addLotMutation]
  );

  return (
    <ProcessContext.Provider
      value={{
        goldBars,
        processes,
        isLoadingBars,
        isLoadingProcesses,
        addBar,
        openProcess,
        closeProcess,
        assignToLot,
      }}
    >
      {children}
    </ProcessContext.Provider>
  );
}

export function useProcess(): ProcessContextType {
  const ctx = useContext(ProcessContext);
  if (!ctx) throw new Error('useProcess debe usarse dentro de un ProcessProvider');
  return ctx;
}
