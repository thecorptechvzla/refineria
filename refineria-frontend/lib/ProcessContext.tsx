'use client';

import { createContext, useContext, useCallback, type ReactNode } from 'react';
import type { GoldBar, Process, ProcessLot } from '@/types/refinery';
import { useGoldBars, useCreateGoldBar } from '@/lib/hooks/useGoldBars';
import { useProcesses, useCreateProcess, useCloseProcess, useUpdateProcessStatus, useUpdateLotRecovered, useAddLot } from '@/lib/hooks/useProcesses';

interface ProcessContextType {
  goldBars: GoldBar[];
  processes: Process[];
  isLoadingBars: boolean;
  isLoadingProcesses: boolean;
  addBar: (data: Omit<GoldBar, 'id' | 'available' | 'registrationDate'>) => Promise<GoldBar>;
  openProcess: (supplierId: string) => Promise<Process>;
  closeProcess: (processId: string, lots?: { id: string; recovered: number }[]) => Promise<Process>;
  assignToLot: (processId: string, barIds: string[]) => Promise<ProcessLot>;
  updateProcessStatus: (processId: string, status: string) => Promise<Process>;
  saveLotRecovered: (processId: string, lotId: string, recovered: number) => Promise<ProcessLot>;
}

const ProcessContext = createContext<ProcessContextType | null>(null);

export function ProcessProvider({ children }: { children: ReactNode }) {
  const { data: goldBars = [], isLoading: isLoadingBars } = useGoldBars();
  const { data: processes = [], isLoading: isLoadingProcesses } = useProcesses();

  const createGoldBar = useCreateGoldBar();
  const createProcess = useCreateProcess();
  const closeProcessMutation = useCloseProcess();
  const addLotMutation = useAddLot();
  const updateProcessStatusMutation = useUpdateProcessStatus();
  const updateLotRecoveredMutation = useUpdateLotRecovered();

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
    async (processId: string, lots?: { id: string; recovered: number }[]) => {
      return closeProcessMutation.mutateAsync({ processId, lots });
    },
    [closeProcessMutation]
  );

  const assignToLot = useCallback(
    async (processId: string, barIds: string[]) => {
      return addLotMutation.mutateAsync({ processId, barIds });
    },
    [addLotMutation]
  );

  const updateProcessStatus = useCallback(
    async (processId: string, status: string) => {
      return updateProcessStatusMutation.mutateAsync({ processId, status });
    },
    [updateProcessStatusMutation]
  );

  const saveLotRecovered = useCallback(
    async (processId: string, lotId: string, recovered: number) => {
      return updateLotRecoveredMutation.mutateAsync({ processId, lotId, recovered });
    },
    [updateLotRecoveredMutation]
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
        updateProcessStatus,
        saveLotRecovered,
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
