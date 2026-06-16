import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { CustomFieldDefinition } from '@/types';

export function useCustomFieldDefinitions(tableName: string) {
  return useQuery({
    queryKey: ['custom-field-defs', tableName],
    queryFn: () => api<CustomFieldDefinition[]>(`/custom-fields/${tableName}`),
    staleTime: 30_000,
  });
}

export function useCreateFieldDefinition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { tableName: string; fieldName: string; fieldType: string; required?: boolean; options?: string }) =>
      api<CustomFieldDefinition>(`/custom-fields/${data.tableName}`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['custom-field-defs', variables.tableName] });
    },
  });
}

export function useDeleteFieldDefinition(tableName: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      api<void>(`/custom-fields/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-field-defs', tableName] });
    },
  });
}
