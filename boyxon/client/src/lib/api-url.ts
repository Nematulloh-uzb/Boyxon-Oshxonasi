import { resolveRuntimeUrl } from './runtime-env';

/**
 * API manzili. Build-time env localhost bo'lsa (yoki umuman berilmasa)
 * production'da Render serveriga tushadi — barcha so'rovlar, jumladan
 * logout/refresh ham bitta manbadan foydalanishi uchun shu yerda saqlanadi.
 */
export const API_URL = resolveRuntimeUrl(
  import.meta.env.VITE_API_URL as string | undefined,
  'http://localhost:5000/api',
  'https://boyxon-server.onrender.com/api',
);

/** API origin (`/api` siz) — health check va OAuth redirect uchun. */
export const API_ORIGIN = API_URL.replace(/\/api\/?$/, '');
