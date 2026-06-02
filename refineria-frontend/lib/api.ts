import axios, { type AxiosRequestConfig } from 'axios';

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

const instance = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

instance.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

instance.interceptors.response.use(
  (res) => res,
  (err) => {
    if (axios.isAxiosError(err)) {
      const data = err.response?.data as Record<string, unknown> | undefined;
      const message =
        typeof data?.message === 'string'
          ? data.message
          : typeof data?.error === 'string'
            ? data.error
            : err.message;
      throw new ApiError(message, err.response?.status || 500);
    }
    throw new ApiError(err instanceof Error ? err.message : 'Unknown error', 500);
  },
);

export async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const config: AxiosRequestConfig = {
    method: options?.method || 'GET',
    url: path,
    data: options?.body ? JSON.parse(options.body as string) : undefined,
    headers: options?.headers as Record<string, string>,
  };

  const res = await instance.request<T>(config);

  if (res.status === 204) return undefined as T;
  return res.data;
}
