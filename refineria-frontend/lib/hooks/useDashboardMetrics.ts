import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { GoldBar, Process } from '@/types/refinery';

export type ProcessSummaryItem = {
  id: string;
  number: string;
  status: string;
  supplierId: string;
  lotCount: number;
  barCount: number;
};

export type SupplierChartRow = {
  id: string;
  name: string;
  ingresado: number;
  boveda: number;
  proceso: number;
  porRefinar: number;
};

export type RecentTransactionItem = {
  id: string;
  type: string;
  weight: number;
  weightUnit: string;
  purity: number;
  supplierId: string | null;
  date: string;
};

export type DashboardMetrics = {
  oroIngresado: number;
  oroEnBoveda: number;
  oroEnProceso: number;
  faltaPorRefinar: number;
  totalBarCount: number;
  availableBarCount: number;
  processCounts: {
    open: number;
    inProgress: number;
    closed: number;
  };
  processSummary: ProcessSummaryItem[];
  supplierChartData: SupplierChartRow[];
  recentTransactions: RecentTransactionItem[];
};

type Params = {
  supplierId?: string;
  startDate?: string;
  endDate?: string;
};

export function useDashboardMetrics(params: Params, enabled = true) {
  const queryString = new URLSearchParams();
  if (params.supplierId && params.supplierId !== 'all') queryString.set('supplierId', params.supplierId);
  if (params.startDate) queryString.set('startDate', params.startDate);
  if (params.endDate) queryString.set('endDate', params.endDate);
  const qs = queryString.toString();

  return useQuery<DashboardMetrics>({
    queryKey: ['dashboard', 'metrics', qs],
    queryFn: () => api<DashboardMetrics>(`/dashboard/metrics${qs ? `?${qs}` : ''}`),
    enabled,
    staleTime: 30_000,
    retry: 2,
  });
}
