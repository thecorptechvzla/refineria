'use client';

import { createContext, useContext, useCallback, type ReactNode } from 'react';
import type { GoldBar, Process, ProcessLot } from '@/types/refinery';
import { useGoldBars, useCreateGoldBar } from '@/lib/hooks/useGoldBars';
import { useProcesses, useCreateProcess, useCloseProcess, useCloseProcessWithActas, useUpdateProcessStatus, useUpdateLotRecovered, useAddLot, useUploadFile } from '@/lib/hooks/useProcesses';

interface ProcessContextType {
  goldBars: GoldBar[];
  processes: Process[];
  isLoadingBars: boolean;
  isLoadingProcesses: boolean;
  addBar: (data: Omit<GoldBar, 'id' | 'available' | 'registrationDate'>) => Promise<GoldBar>;
  openProcess: (supplierId: string) => Promise<Process>;
  closeProcess: (processId: string, lots?: { id: string; recovered: number }[]) => Promise<Process>;
  closeProcessWithActas: (processId: string, actas: { actaRecepcion: string; actaFundicion: string; actaConformidad: string }) => Promise<Process>;
  uploadFile: (file: File) => Promise<{ url: string }>;
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
  const closeProcessWithActasMutation = useCloseProcessWithActas();
  const uploadFileMutation = useUploadFile();
  const addLotMutation = useAddLot();
  const updateProcessStatusMutation = useUpdateProcessStatus();
  const updateLotRecoveredMutation = useUpdateLotRecovered();

  const addBar = useCallback(
    async (data: Omit<GoldBar, 'id' | 'available' | 'registrationDate'>) => {
      const cleaned = { ...data, ley: data.ley ?? undefined, leyAg: data.leyAg ?? undefined, analyticalAg: data.analyticalAg ?? undefined };
      return createGoldBar.mutateAsync(cleaned);
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

  const closeProcessWithActas = useCallback(
    async (
      processId: string,
      actas: { actaRecepcion: string; actaFundicion: string; actaConformidad: string },
    ) => {
      return closeProcessWithActasMutation.mutateAsync({
        processId,
        actaRecepcion: actas.actaRecepcion,
        actaFundicion: actas.actaFundicion,
        actaConformidad: actas.actaConformidad,
      });
    },
    [closeProcessWithActasMutation]
  );

  const uploadFile = useCallback(
    async (file: File) => {
      return uploadFileMutation.mutateAsync(file);
    },
    [uploadFileMutation]
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
        closeProcessWithActas,
        uploadFile,
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
