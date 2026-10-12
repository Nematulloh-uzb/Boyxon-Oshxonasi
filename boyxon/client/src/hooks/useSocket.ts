import { useEffect, useRef } from 'react';
import { io, type Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthStore } from '../store/auth.store';

const SOCKET_URL = (import.meta.env.VITE_SOCKET_URL as string | undefined) ?? 'http://localhost:5000';

/**
 * Toast ko'rsatilsinmi — foydalanuvchi bildirishnoma sozlamalariga bog'liq.
 * pushEnabled = umumiy "yoqish/o'chirish"; qolganlari kategoriya bo'yicha.
 */
function toastAllowed(type: string): boolean {
  const p = useAuthStore.getState().user?.notificationPrefs;
  if (!p) return true;
  if (p.pushEnabled === false) return false;
  switch (type) {
    case 'order':
      return p.orderUpdates !== false;
    case 'promo':
      return p.promos !== false;
    case 'new_dish':
      return p.newDishes !== false;
    case 'system':
    case 'bonus':
      return p.systemMessages !== false;
    default:
      return true;
  }
}

/** Login dan keyin socket ulanish — order:status da toast + query invalidate. */
export function useSocket(): void {
  const token = useAuthStore((s) => s.accessToken);
  const qc = useQueryClient();
  const ref = useRef<Socket | null>(null);

  useEffect(() => {
    if (!token) {
      ref.current?.disconnect();
      ref.current = null;
      return;
    }
    const socket = io(SOCKET_URL, { auth: { token } });
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
    socket.on('connect_error', () => undefined);
    return () => {
      socket.disconnect();
      ref.current = null;
    };
  }, [token, qc]);
}
