import axios, { create, type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { getRefreshToken, setRefreshToken } from '../lib/tokenStorage';
import { useAuthStore } from '../store/auth.store';
import type { AuthPayload } from './types';

/**
 * API manzili bir marta bundle'ga yoziladi (EXPO_PUBLIC_API_URL).
 * Standart: Render'dagi production server.
 */
export const API_URL =
  (process.env.EXPO_PUBLIC_API_URL as string | undefined)?.replace(/\/+$/, '') ??
  'https://boyxon-server.onrender.com/api';

/** Mobil qurilma ekanini bildiruvchi header — server refreshToken'ni body'da ham qaytaradi. */
export const CLIENT_HEADERS = { 'x-client': 'mobile' } as const;

export const api = create({
  baseURL: API_URL,
  timeout: 20000,
  headers: {
    Accept: 'application/json',
    ...CLIENT_HEADERS,
  },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.set('Authorization', `Bearer ${token}`);
  return config;
});

const AUTH_PATHS = [
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
  '/auth/logout',
  '/auth/logout-all',
  '/auth/google',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/change-password',
  '/auth/resend-verification',
  '/auth/verify-email',
];

let refreshing = false;
let queue: ((t: string | null) => void)[] = [];

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    const url = original?.url ?? '';
    const isAuthEndpoint = AUTH_PATHS.some((p) => url.includes(p));

    if (error.response?.status === 401 && original && !original._retry && !isAuthEndpoint) {
      original._retry = true;
      if (refreshing) {
        return new Promise((resolve, reject) => {
          queue.push((t) => {
            if (!t) return reject(error);
            original.headers.set('Authorization', `Bearer ${t}`);
            resolve(api(original));
          });
        });
      }
      refreshing = true;
      try {
        const token = await refreshSession();
        queue.forEach((fn) => fn(token));
        queue = [];
        original.headers.set('Authorization', `Bearer ${token}`);
        return api(original);
      } catch {
        queue.forEach((fn) => fn(null));
        queue = [];
        void useAuthStore.getState().logout();
        return Promise.reject(error);
      } finally {
        refreshing = false;
      }
    }
    return Promise.reject(error);
  },
);

/**
 * Refresh token orqali yangi access token (single-flight — bir vaqtda bitta so'rov).
 * Server refresh tokenni rotatsiya qiladi — yangisi saqlanadi.
 */
export async function refreshSession(): Promise<string> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) throw new Error('Refresh token topilmadi');

  // ATAYIN xom axios — interceptor'lar refresh so'rovini qayta ishlamasligi uchun.
  const { data } = await axios.post(
    `${API_URL}/auth/refresh`,
    { refreshToken },
    { headers: { Accept: 'application/json', ...CLIENT_HEADERS }, timeout: 20000 },
  );
  const payload = data.data as AuthPayload;
  useAuthStore.getState().setToken(payload.accessToken);
  if (payload.user) useAuthStore.getState().setUser(payload.user);
  if (payload.refreshToken) await setRefreshToken(payload.refreshToken);
  return payload.accessToken as string;
}

/** Xato uchun foydalanuvchiga ko'rsatiladigan matn (server xabari bo'lsa o'sha). */
export function apiErrorMessage(error: unknown, fallback = 'Xatolik yuz berdi'): string {
  const err = error as AxiosError<{ message?: string }>;
  const message = err?.response?.data?.message;
  if (typeof message === 'string' && message.length > 0) return message;
  if (err?.code === 'ECONNABORTED' || err?.message?.includes('timeout')) {
    return 'Server javob bermadi. Internetni tekshiring.';
  }
  if (err?.message === 'Network Error' || err?.code === 'ERR_NETWORK') {
    return 'Internet aloqasi yo\u2019q.';
  }
  return fallback;
}
