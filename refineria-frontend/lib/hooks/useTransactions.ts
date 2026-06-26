import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Transaction } from '@/types';

type CreateTransactionData = {
  type: 'IN' | 'OUT';
  weight?: number;
  weightUnit?: 'g' | 'kg';
  purity?: number;
  supplierId?: string;
  lotId?: string;
};

type MetricsResponse = {
  totalIngresos: number;
  totalEgresos: number;
  balance: number;
  workersActivos: number;
  workersInactivos: number;
  workersTotal: number;
};

type TransactionsResponse = {
  data: Transaction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export function useTransactions() {
  return useQuery({
    queryKey: ['transactions'],
    queryFn: () => api<TransactionsResponse>('/transactions').then((r) => r.data),
    staleTime: 30_000,
  });
}

export function useTransactionMetrics() {
  return useQuery({
    queryKey: ['transactions', 'metrics'],
    queryFn: () => api<MetricsResponse>('/transactions/metrics'),
    staleTime: 30_000,
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTransactionData) =>
      api<Transaction>('/transactions', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transactions', 'metrics'] });
      queryClient.invalidateQueries({ queryKey: ['processes'] });
    },
  });
}

export function useCreateEgresoLot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (lotId: string) =>
      api<Transaction>('/transactions', {
        method: 'POST',
        body: JSON.stringify({ type: 'OUT', lotId }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transactions', 'metrics'] });
      queryClient.invalidateQueries({ queryKey: ['processes'] });
    },
  });
}

export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<CreateTransactionData>) =>
      api<Transaction>(`/transactions/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transactions', 'metrics'] });
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      api<void>(`/transactions/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transactions', 'metrics'] });
    },
  });
}
