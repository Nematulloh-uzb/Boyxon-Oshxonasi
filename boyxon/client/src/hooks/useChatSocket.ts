import { useEffect, useRef, useCallback } from 'react';
import { io, type Socket } from 'socket.io-client';
import { useAuthStore } from '../store/auth.store';

const SOCKET_URL = (import.meta.env.VITE_SOCKET_URL as string | undefined) ?? 'http://localhost:5000';

export interface ChatHandlers {
  onMessage?: (payload: { message?: unknown; user?: unknown }) => void;
  onTyping?: (payload: { from?: string; role?: string }) => void;
  onConversationUpdated?: () => void;
}

/**
 * Chat real-time ulanish — chat sahifalari/panellari uchun alohida socket.
 * order:status / notification:new bilan aralashmasligi uchun alohida boshqariladi.
 * Faqat login bo'lganda ulanadi (token kerak).
 */
export function useChatSocket(handlers: ChatHandlers, enabled = true): Socket | null {
  const token = useAuthStore((s) => s.accessToken);
  const socketRef = useRef<Socket | null>(null);
  const hRef = useRef(handlers);
  hRef.current = handlers; // har renderda yangilaymiz — stale closure'ni oldini olamiz

  useEffect(() => {
    if (!token || !enabled) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      return;
    }
    const socket = io(SOCKET_URL, { auth: { token } });
    socketRef.current = socket;

    socket.on('chat:message', (p) => hRef.current.onMessage?.(p as Parameters<NonNullable<ChatHandlers['onMessage']>>[0]));
    socket.on('chat:typing', (p) => hRef.current.onTyping?.(p as Parameters<NonNullable<ChatHandlers['onTyping']>>[0]));
    socket.on('chat:conversation-updated', () => hRef.current.onConversationUpdated?.());
    socket.on('connect_error', () => undefined);

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, enabled]);

  return socketRef.current;
}

/** "Yozmoqda" signalini yuborish uchun yordamchi. */
export function useChatTyping(socket: Socket | null) {
  return useCallback(
    (to?: string) => {
      socket?.emit('chat:typing', { to });
    },
    [socket],
  );
}
