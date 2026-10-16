import { useEffect, useRef } from 'react';
import { io, type Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthStore } from '../store/auth.store';
import { authApi } from '../api/auth.api';

const SOCKET_URL = (import.meta.env.VITE_SOCKET_URL as string | undefined) ?? 'http://localhost:5000';

/**
 * Toast ko'rsatilsinmi — faqat umumiy "Sayt bildirishnomalari" (pushEnabled) ga bog'liq.
 */
function toastAllowed(type: string): boolean {
  void type; // kategoriya bo'yicha filtr yo'q — endi faqat umumiy switch.
  const p = useAuthStore.getState().user?.notificationPrefs;
  if (!p) return true;
  return p.pushEnabled !== false;
}

/**
 * Login dan keyin socket ulanish — order:status da toast + query invalidate.
 *
 * Token yangilanishi: access token 15 daqiqada eskiradi, shuning uchun
 * `connect_error` da "Token yaroqsiz" bo'lsa — axios refresh qilgach yangi
 * token bilan qayta ulanish uchun `auth.token` har safar yangilanadi.
 * Eng ishonchli yo'l: token o'zgarganda socket'ni qayta yaratish (pastda deps).
 */
export function useSocket(): void {
  const token = useAuthStore((s) => s.accessToken);
  const qc = useQueryClient();
  const ref = useRef<Socket | null>(null);
  const tokenRef = useRef<string | null>(null);
  const lastRefreshAtRef = useRef(0);
  tokenRef.current = token;

  useEffect(() => {
    if (!token) {
      ref.current?.disconnect();
      ref.current = null;
      return;
    }
    // Eski ulanishni yopib, YANGI token bilan ochamiz (token refresh holati).
    ref.current?.disconnect();
    const socket = io(SOCKET_URL, {
      auth: (cb) => cb({ token: tokenRef.current ?? token }),
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
    });
    ref.current = socket;
    socket.on('order:status', (p: { message?: string }) => {
      if (toastAllowed('order')) toast.info(p.message ?? 'Buyurtma holati yangilandi');
      qc.invalidateQueries({ queryKey: ['orders'] });
      qc.invalidateQueries({ queryKey: ['notifications'] });
      qc.invalidateQueries({ queryKey: ['unread-count'] });
    });
    // Real-time bildirishnoma — server yaratishi bilanoq qo'ng'iroq badge'i yangilanadi.
    socket.on('notification:new', (p: { type?: string; title?: string; message?: string }) => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
      qc.invalidateQueries({ queryKey: ['unread-count'] });
      // order hodisasi o'z toast'ini beradi — ikki marta chiqmasligi uchun faqat boshqa turlar.
      const type = p.type ?? '';
      if (type !== 'order' && toastAllowed(type)) toast.info(p.message ?? p.title ?? 'Yangi bildirishnoma');
    });
    socket.on('connect_error', (err: Error) => {
      // Access token eskirgan bo'lsa — axios kabi refresh qilib, yangi token bilan
      // qayta ulanamiz. Avval bu yerda `socket.disconnect()` chaqirilardi: u
      // socket.io ning avtomatik reconnect'ini ham o'chirib qo'yardi va token
      // boshqa so'rovda yangilanmaguncha socket o'lik qolardi (order/bildirishnoma
      // yangilanishlari kelmay qolardi).
      if (!/token/i.test(err.message)) return;
      const now = Date.now();
      if (now - lastRefreshAtRef.current < 30_000) return; // spam oldini olish
      lastRefreshAtRef.current = now;
      void authApi
        .refresh()
        .then((r) => {
          // setToken → token deps o'zgaradi → bu effect yangi socket ochadi.
          useAuthStore.getState().setToken(r.data.accessToken);
          if (r.data.user) useAuthStore.getState().setUser(r.data.user);
        })
        .catch(() => {
          // Refresh cookie ham yaroqsiz — keyingi REST so'rovlar axios
          // interceptor orqali logout qiladi, bu yerda takror urinmaymiz.
        });
    });
    return () => {
      socket.disconnect();
      if (ref.current === socket) ref.current = null;
    };
  }, [token, qc]);
}
