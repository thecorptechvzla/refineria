import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, apiUpload } from '@/lib/api';
import type { Process, ProcessLot } from '@/types/refinery';

export function useProcesses() {
  return useQuery({
    queryKey: ['processes'],
    queryFn: () => api<Process[]>('/processes'),
    staleTime: 30_000,
  });
}

export function useCreateProcess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (supplierId: string) =>
      api<Process>('/processes', {
        method: 'POST',
        body: JSON.stringify({ supplierId }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['processes'] });
    },
  });
}

export function useCloseProcess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      processId,
      lots,
    }: {
      processId: string;
      lots?: { id: string; recovered: number }[];
    }) =>
      api<Process>(`/processes/${processId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'closed', lots }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['processes'] });
      queryClient.invalidateQueries({ queryKey: ['gold-bars'] });
    },
  });
}

export function useDeleteProcess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      api<void>(`/processes/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['processes'] });
      queryClient.invalidateQueries({ queryKey: ['gold-bars'] });
    },
  });
}

export function useRemoveBarsFromLot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      processId,
      lotId,
      barIds,
    }: {
      processId: string;
      lotId: string;
      barIds: string[];
    }) =>
      api<void>(`/processes/${processId}/lots/${lotId}/bars`, {
        method: 'PATCH',
        body: JSON.stringify({ barIds }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['processes'] });
      queryClient.invalidateQueries({ queryKey: ['gold-bars'] });
    },
  });
}

export function useUpdateProcessStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ processId, status }: { processId: string; status: string }) =>
      api<Process>(`/processes/${processId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['processes'] });
    },
  });
}

export function useUpdateLotRecovered() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      processId,
      lotId,
      recovered,
    }: {
      processId: string;
      lotId: string;
      recovered: number;
    }) =>
      api<ProcessLot>(`/processes/${processId}/lots/${lotId}`, {
        method: 'PATCH',
        body: JSON.stringify({ recovered }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['processes'] });
    },
  });
}

export function useAddLot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ processId, barIds }: { processId: string; barIds: string[] }) =>
      api<ProcessLot>(`/processes/${processId}/lots`, {
        method: 'POST',
        body: JSON.stringify({ barIds }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['processes'] });
      queryClient.invalidateQueries({ queryKey: ['gold-bars'] });
    },
  });
}

export function useUploadFile() {
  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return apiUpload<{ url: string }>('/files/upload', formData);
    },
  });
}

export function useCloseProcessWithActas() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      processId,
      actaRecepcion,
      actaFundicion,
      actaConformidad,
    }: {
      processId: string;
      actaRecepcion: string;
      actaFundicion: string;
      actaConformidad: string;
    }) =>
      api<Process>(`/processes/${processId}/close`, {
        method: 'PATCH',
        body: JSON.stringify({ actaRecepcion, actaFundicion, actaConformidad }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['processes'] });
      queryClient.invalidateQueries({ queryKey: ['gold-bars'] });
    },
  });
}

export function useClosedProcessesBySupplier(supplierId: string | null) {
  return useQuery({
    queryKey: ['processes', 'closed', supplierId],
    queryFn: () => api<Process[]>(`/processes/closed-by-supplier/${supplierId}`),
    enabled: !!supplierId,
    staleTime: 15_000,
  });
}
