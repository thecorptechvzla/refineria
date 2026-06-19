import axios, { type AxiosRequestConfig } from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

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

export async function apiUpload<T>(path: string, formData: FormData): Promise<T> {
  const res = await instance.request<T>({
    method: 'POST',
    url: path,
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}
