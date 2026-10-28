import { API_ORIGIN } from './api-url';
import { resolveRuntimeUrl } from './runtime-env';

/**
 * WebSocket manzili.
 *
 * `VITE_SOCKET_URL` berilgan bo'lsa — o'sha origin ishlatiladi (oxirida `/ws`
 * bo'lmasa qo'shiladi). Aks holda API origin'idan hosil qilinadi:
 *   http://localhost:5000      → ws://localhost:5000/ws
 *   https://api.example.com    → wss://api.example.com/ws
 */
function toWsUrl(value: string): string {
  const trimmed = value.replace(/\/+$/, '');
  if (/^wss?:\/\//i.test(trimmed)) {
    return trimmed.endsWith('/ws') ? trimmed : `${trimmed}/ws`;
  }
  const wsOrigin = trimmed.replace(/^http/i, 'ws');
  return wsOrigin.endsWith('/ws') ? wsOrigin : `${wsOrigin}/ws`;
}

const configured = import.meta.env.VITE_SOCKET_URL as string | undefined;

export const REALTIME_URL = toWsUrl(
  resolveRuntimeUrl(configured, 'http://localhost:5000', API_ORIGIN),
);
