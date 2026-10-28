import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthStore } from '../store/auth.store';
import { REALTIME_URL } from '../lib/realtime-url';
import { RealtimeClient } from '../lib/realtime';
import { refreshAccessTokenOnce } from '../lib/realtime-token';

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
 * Login dan keyin WebSocket ulanish — order:status da toast + query invalidate.
 *
 * Token yangilanishi: access token 15 daqiqada eskiradi. WebSocket upgrade
 * 401 bilan rad etilsa `onUnauthorized` orqali axios refresh chaqiriladi;
 * `setToken` token deps'ni o'zgartiradi va bu effect yangi ulanish ochadi.
 */
export function useSocket(): void {
  const token = useAuthStore((s) => s.accessToken);
  const qc = useQueryClient();
  const tokenRef = useRef<string | null>(null);
  tokenRef.current = token;

  useEffect(() => {
    if (!token) return;

    const client = new RealtimeClient({
      url: REALTIME_URL,
      getToken: () => tokenRef.current,
      onUnauthorized: refreshAccessTokenOnce,
    });

    client.on('order:status', (data) => {
      const p = (data ?? {}) as { message?: string };
      if (toastAllowed('order')) toast.info(p.message ?? 'Buyurtma holati yangilandi');
      qc.invalidateQueries({ queryKey: ['orders'] });
      // Ochiq turgan buyurtma sahifasi ham jonli yangilanadi.
      qc.invalidateQueries({ queryKey: ['order'] });
      qc.invalidateQueries({ queryKey: ['notifications'] });
      qc.invalidateQueries({ queryKey: ['unread-count'] });
    });

    // Real-time bildirishnoma — server yaratishi bilanoq qo'ng'iroq badge'i yangilanadi.
    client.on('notification:new', (data) => {
      const p = (data ?? {}) as { type?: string; title?: string; message?: string };
      qc.invalidateQueries({ queryKey: ['notifications'] });
      qc.invalidateQueries({ queryKey: ['unread-count'] });
      // order hodisasi o'z toast'ini beradi — ikki marta chiqmasligi uchun faqat boshqa turlar.
      const type = p.type ?? '';
      if (type !== 'order' && toastAllowed(type)) {
        toast.info(p.message ?? p.title ?? 'Yangi bildirishnoma');
      }
    });

    client.connect();

    return () => client.disconnect();
  }, [token, qc]);
}
