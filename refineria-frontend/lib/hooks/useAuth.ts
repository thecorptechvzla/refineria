import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { User } from '@/types';

type LoginResponse = {
  token: string;
  user: User;
};

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      api<LoginResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: (res) => {
      queryClient.setQueryData(['profile'], res.user);
    },
  });
}

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => api<User>('/auth/profile'),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return () => {
    document.cookie = 'goldtrack_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    queryClient.clear();
    window.location.href = '/login';
  };
}
