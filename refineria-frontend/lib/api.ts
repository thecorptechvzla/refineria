const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';
const STORAGE_KEY = 'goldtrack_token';

function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEY);
}

function setStoredToken(token: string | null) {
  if (typeof window === 'undefined') return;
  if (token) localStorage.setItem(STORAGE_KEY, token);
  else localStorage.removeItem(STORAGE_KEY);
}

export function setAuthToken(token: string | null) {
  setStoredToken(token);
}

export function getAuthToken(): string | null {
  return getStoredToken();
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const token = getStoredToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers: { ...headers, ...(options?.headers as Record<string, string>) },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(body.message || body.error || res.statusText, res.status);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}
