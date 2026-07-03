import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { GoldBar, Process } from '@/types/refinery';

type EnrichedProcess = Process & {
  lotDetails: (Process['lots'][number] & { bars: GoldBar[] })[];
};

export function useProcessDetail(id: string | null) {
  return useQuery<EnrichedProcess>({
    queryKey: ['process', 'detail', id],
    queryFn: () => api<EnrichedProcess>(`/processes/${id}/detail`),
    enabled: !!id,
    staleTime: 60_000,
  });
}
