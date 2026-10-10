import { useEffect, useRef } from 'react';
import { io, type Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthStore } from '../store/auth.store';

const SOCKET_URL = (import.meta.env.VITE_SOCKET_URL as string | undefined) ?? 'http://localhost:5000';

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
      toast.info(p.message ?? 'Buyurtma holati yangilandi');
      qc.invalidateQueries({ queryKey: ['orders'] });
      qc.invalidateQueries({ queryKey: ['notifications'] });
    });
    socket.on('connect_error', () => undefined);
    return () => {
      socket.disconnect();
      ref.current = null;
    };
  }, [token, qc]);
}
