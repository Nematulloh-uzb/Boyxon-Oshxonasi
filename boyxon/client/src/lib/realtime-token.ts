import { authApi } from '../api/auth.api';
import { useAuthStore } from '../store/auth.store';

let inFlight: Promise<void> | null = null;
let lastAttemptAt = 0;

/**
 * Access token eskirganda bir marta refresh qiladi.
 *
 * WebSocket upgrade 401 bilan rad etilsa brauzer faqat `1006` beradi —
 * shu sababli token yangilab, yangi token bilan qayta ulanamiz.
 * 30 soniyalik throttle spam'ning oldini oladi.
 */
export function refreshAccessTokenOnce(): void {
  const now = Date.now();
  if (inFlight || now - lastAttemptAt < 30_000) return;
  lastAttemptAt = now;

  inFlight = authApi
    .refresh()
    .then((res) => {
      const state = useAuthStore.getState();
      state.setToken(res.data.accessToken);
      if (res.data.user) state.setUser(res.data.user);
    })
    .catch(() => {
      // Refresh cookie ham yaroqsiz — REST interceptor keyingi so'rovda logout qiladi.
    })
    .finally(() => {
      inFlight = null;
    });
}
