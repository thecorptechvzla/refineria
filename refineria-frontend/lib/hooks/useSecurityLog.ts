import { useQuery } from '@tanstack/react-query';

export type LoginSecurityRecord = {
  id: string;
  email: string;
  ipAddress: string;
  attempts: number;
  isBlocked: boolean;
  createdAt: string;
  updatedAt: string;
};

async function fetchSecurityLog(): Promise<LoginSecurityRecord[]> {
  const res = await fetch('/api/auth/security-log', {
    credentials: 'include',
  });
  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      return [];
    }
    throw new Error('Error al cargar el registro de seguridad');
  }
  return res.json();
}

export function useSecurityLog() {
  return useQuery({
    queryKey: ['security-log'],
    queryFn: fetchSecurityLog,
    retry: false,
  });
}
