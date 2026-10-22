import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { api } from './axios';
import { ensureServerReady } from './health.api';

/**
 * Render free-tier sovuq startida proksi ba'zan HTTP 200 + o'zining
 * "Application loading" HTML sahifasini qaytaradi (yoki 502/503/504).
 * Bunday javob JSON deb hisoblansa, React Query keshiga HTML tushib,
 * sahifa yiqilishi mumkin edi.
 *
 * Bu interceptor shunday javobni ushlaydi, server uyg'onishini kutadi va
 * so'rovni bir marta qayta yuboradi. Foydalanuvchi xato o'rniga oddiy
 * kutish holatini ko'radi (banner `ServerWakeNotice` orqali).
 */

type WakeConfig = InternalAxiosRequestConfig & { _wakeRetry?: boolean };

/** Render uyg'onish paytida qaytaradigan vaqtinchalik statuslar. */
const WAKE_STATUSES = new Set([502, 503, 504]);

function isRenderLoadingPage(response: AxiosResponse): boolean {
  if (typeof response.data !== 'string') return false;

  const contentType = String(response.headers['content-type'] ?? '');
  if (contentType.includes('application/json')) return false;

  // HTML javob API uchun hech qachon normal emas.
  return response.data.trimStart().startsWith('<');
}

async function retryAfterWake(config: WakeConfig): Promise<AxiosResponse> {
  config._wakeRetry = true;
  await ensureServerReady();
  return api.request(config);
}

/** Bir marta chaqiriladi (main.tsx) — global interceptor o'rnatadi. */
export function installWakeRetry(): void {
  api.interceptors.response.use(
    async (response) => {
      const config = response.config as WakeConfig;
      if (config._wakeRetry || !isRenderLoadingPage(response)) return response;
      return retryAfterWake(config);
    },
    async (error: AxiosError) => {
      const config = error.config as WakeConfig | undefined;
      const status = error.response?.status;

      if (!config || config._wakeRetry || status === undefined || !WAKE_STATUSES.has(status)) {
        return Promise.reject(error);
      }

      try {
        return await retryAfterWake(config);
      } catch {
        // Server baribir uyg'onmasa — asl xatoni qaytaramiz.
        return Promise.reject(error);
      }
    },
  );
}
