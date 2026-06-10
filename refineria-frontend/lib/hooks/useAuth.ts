import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, setAuthToken } from '@/lib/api';
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
      setAuthToken(res.token);
      document.cookie = `goldtrack_session=${res.token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
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

  return async () => {
    setAuthToken(null);
    document.cookie = 'goldtrack_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax';
    try { await api('/auth/logout', { method: 'POST' }); } catch {}
    queryClient.clear();
    window.location.href = '/login';
  };
}
