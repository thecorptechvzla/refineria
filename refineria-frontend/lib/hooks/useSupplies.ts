import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { SupplyItem, SupplyTransaction, SupplyCategory, SupplyTransactionType, CriticalType } from '@/types';

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
      isCritical?: boolean;
      criticalType?: CriticalType;
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
      reference: string;
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

export function useCreateBulkSupplyTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      type: SupplyTransactionType;
      destination: string;
      items: (
        | { itemId: string; quantity: number }
        | { name: string; category: SupplyCategory; unit?: string; quantity: number }
      )[];
    }) =>
      api<SupplyTransaction[]>('/supplies/transactions/bulk', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplies', 'items'] });
    },
  });
}

export function useDeleteSupplyItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      api(`/supplies/items/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplies', 'items'] });
    },
  });
}

export function useSupplyHistory(itemId: string | null) {
  return useQuery({
    queryKey: ['supplies', 'history', itemId],
    queryFn: () => api<SupplyTransaction[]>(`/supplies/items/${itemId}/transactions`),
    enabled: !!itemId,
    staleTime: 15_000,
  });
}
