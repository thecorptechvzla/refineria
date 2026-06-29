import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { SupplyItem, SupplyTransaction, SupplyCategory, SupplyTransactionType } from '@/types';

export function useSupplyItems(category?: string) {
  return useQuery({
    queryKey: ['supplies', 'items', category],
    queryFn: () => {
      const params = category ? `?category=${category}` : '';
      return api<SupplyItem[]>(`/supplies/items${params}`);
    },
    staleTime: 30_000,
  });
}

export function useCreateSupplyItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      code: string;
      name: string;
      category: SupplyCategory;
      unit?: string;
      criticalLevel?: number;
    }) =>
      api<SupplyItem>('/supplies/items', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplies', 'items'] });
    },
  });
}

export function useCreateSupplyTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      itemId: string;
      type: SupplyTransactionType;
      quantity: number;
      reference?: string;
    }) =>
      api<SupplyTransaction>('/supplies/transactions', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplies', 'items'] });
    },
  });
}
