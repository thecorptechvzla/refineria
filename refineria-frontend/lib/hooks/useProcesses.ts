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
      bars,
    }: {
      processId: string;
      lotId: string;
      recovered?: number;
      bars?: { barId: string; leyAg: number }[];
    }) =>
      api<ProcessLot>(`/processes/${processId}/lots/${lotId}`, {
        method: 'PATCH',
        body: JSON.stringify({ recovered, bars }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['processes'] });
      queryClient.invalidateQueries({ queryKey: ['gold-bars'] });
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

export function useSaveActaUrl() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      processId,
      ...urls
    }: {
      processId: string;
      actaRecepcion?: string | null;
      actaFundicion?: string | null;
      actaConformidad?: string | null;
    }) =>
      api<Process>(`/processes/${processId}/actas`, {
        method: 'PATCH',
        body: JSON.stringify(urls),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['processes'] });
    },
  });
}

export function useUploadFile() {
  return useMutation({
    mutationFn: async (file: File): Promise<{ url: string }> => {
      const tokenRes = await fetch('/api/blob/upload', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          type: 'blob.generate-client-token',
          payload: {
            pathname: file.name,
            clientPayload: null,
            multipart: false,
          },
        }),
      });

      if (!tokenRes.ok) {
        const err = await tokenRes.json().catch(() => ({}));
        throw new Error(err.error || 'Error al obtener token de subida');
      }

      const { clientToken } = await tokenRes.json();
      const storeId = clientToken.split('_')[3];
      const params = new URLSearchParams({ pathname: file.name });

      const uploadRes = await fetch(`https://vercel.com/api/blob/?${params.toString()}`, {
        method: 'PUT',
        credentials: 'omit',
        headers: {
          authorization: `Bearer ${clientToken}`,
          'x-vercel-blob-store-id': storeId,
          'x-vercel-blob-access': 'private',
          'x-api-version': '12',
          'x-api-blob-request-id': `${storeId}:${Date.now()}:${Math.random().toString(16).slice(2)}`,
          'x-api-blob-request-attempt': '0',
          'x-content-type': file.type || 'application/pdf',
        },
        body: file,
      });

      if (!uploadRes.ok) {
        const errBody = await uploadRes.text().catch(() => '');
        console.error('[Vercel Blob PUT Error]', uploadRes.status, errBody);
        throw new Error(`Error al subir archivo (${uploadRes.status})`);
      }

      const result = await uploadRes.json();
      return { url: result.url };
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
