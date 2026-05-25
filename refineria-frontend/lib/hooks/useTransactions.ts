import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Transaction } from '@/types';

type CreateTransactionData = {
  type: 'IN' | 'OUT';
  weight: number;
  weightUnit: 'g' | 'kg';
  purity: number;
  supplierId?: string;
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
    },
  });
}
