import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { GoldBar } from '@/types/refinery';

type CreateGoldBarData = {
  code: string;
  supplierId: string;
  grossWeight: number;
  analytical: number;
  expected: number;
  recovered?: number;
  leyAg?: number;
  analyticalAg?: number;
};

export function useGoldBars(available?: boolean) {
  const params = available !== undefined ? `?available=${available}` : '';
  return useQuery({
    queryKey: ['gold-bars', { available }],
    queryFn: () => api<GoldBar[]>(`/gold-bars${params}`),
    staleTime: 30_000,
  });
}

export function useCreateGoldBar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateGoldBarData) =>
      api<GoldBar>('/gold-bars', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gold-bars'] });
    },
  });
}

export function useUpdateGoldBar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: Partial<GoldBar> & { id: string }) =>
      api<GoldBar>(`/gold-bars/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gold-bars'] });
    },
  });
}

export function useDeleteGoldBar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      api<void>(`/gold-bars/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gold-bars'] });
    },
  });
}
