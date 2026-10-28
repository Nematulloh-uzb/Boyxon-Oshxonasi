import { resolveRuntimeUrl } from './runtime-env';

/**
 * API manzili. Production'da standart holat — o'z origin'imiz (`/api`):
 * Cloudflare Worker ham statik fayllarni, ham API'ni bitta domenda beradi.
 * `VITE_API_URL` berilgan bo'lsa (masalan, alohida API domeni) — o'sha ishlatiladi.
 */
export const API_URL = resolveRuntimeUrl(
  import.meta.env.VITE_API_URL as string | undefined,
  'http://localhost:5000/api',
  `${window.location.origin}/api`,
);

/** API origin (`/api` siz) — health check va OAuth redirect uchun. */
export const API_ORIGIN = API_URL.replace(/\/api\/?$/, '');
