import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
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
    mutationFn: (processId: string) =>
      api<Process>(`/processes/${processId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'closed' }),
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
