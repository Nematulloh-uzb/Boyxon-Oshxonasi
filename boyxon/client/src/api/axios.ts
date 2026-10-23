import axios from 'axios';
import { useAuthStore } from '../store/auth.store';
import { API_URL, API_ORIGIN } from '../lib/api-url';

export { API_ORIGIN };

export const api = axios.create({ baseURL: API_URL, withCredentials: true });

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshing = false;
let queue: ((t: string | null) => void)[] = [];

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config as (typeof error.config & { _retry?: boolean });
    const isAuthEndpoint =
      original?.url?.includes('/auth/login') ||
      original?.url?.includes('/auth/register') ||
      original?.url?.includes('/auth/refresh') ||
      original?.url?.includes('/auth/google') ||
      original?.url?.includes('/auth/forgot-password') ||
      original?.url?.includes('/auth/reset-password');

    if (error.response?.status === 401 && original && !original._retry && !isAuthEndpoint) {
      original._retry = true;
      if (refreshing) {
        return new Promise((resolve, reject) => {
          queue.push((t) => {
            if (!t) return reject(error);
            original.headers.Authorization = `Bearer ${t}`;
            resolve(api(original));
          });
        });
      }
      refreshing = true;
      try {
        const { data } = await axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true });
        const token = data.data.accessToken as string | null;
        // Cookie yo'q (mehmon) — 200 + null qaytadi; `Bearer null` bilan qayta
        // urinmaymiz, sessiyani tozalab, asl xatoni qaytaramiz.
        if (!token) {
          queue.forEach((fn) => fn(null));
          queue = [];
          useAuthStore.getState().logout();
          return Promise.reject(error);
        }
        useAuthStore.getState().setToken(token);
        if (data.data.user) useAuthStore.getState().setUser(data.data.user);
        queue.forEach((fn) => fn(token));
        queue = [];
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      } catch (e) {
        queue.forEach((fn) => fn(null));
        queue = [];
        useAuthStore.getState().logout();
        return Promise.reject(error);
      } finally {
        refreshing = false;
      }
    }
    return Promise.reject(error);
  },
);
