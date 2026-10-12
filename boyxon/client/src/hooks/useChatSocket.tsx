import { useEffect, useRef, useCallback } from 'react';
import { io, type Socket } from 'socket.io-client';
import { toast } from 'sonner';
import { MessageCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/auth.store';

const SOCKET_URL = (import.meta.env.VITE_SOCKET_URL as string | undefined) ?? 'http://localhost:5000';
const SESSION_KEY = 'boyxon-chat-open';

/** Chat oynasi (mijoz widget / admin panel) hozir ochiqmi — toast berishga qaror qilish uchun. */
export function isChatOpen(): boolean {
  try {
    return localStorage.getItem(SESSION_KEY) === '1';
  } catch {
    return false;
  }
}
export function setChatOpen(open: boolean): void {
  try {
    localStorage.setItem(SESSION_KEY, open ? '1' : '0');
  } catch {
    /* ignore */
  }
}

export interface ChatHandlers {
  onMessage?: (payload: { message?: unknown; user?: unknown }) => void;
  onTyping?: (payload: { from?: string; role?: string }) => void;
  onConversationUpdated?: () => void;
}

type ChatMsgLike = { text?: string; senderRole?: string; sender?: unknown };

/**
 * Chat real-time ulanish — chat sahifalari/panellari uchun alohida socket.
 * order:status / notification:new bilan aralashmasligi uchun alohida boshqariladi.
 * Faqat login bo'lganda ulanadi (token kerak).
 * Har yangi xabarda: qisqa ovoz chalinadi; chat oynasi yopiq bo'lsa toast ko'rsatiladi.
 */
export function useChatSocket(handlers: ChatHandlers, enabled = true): Socket | null {
  const token = useAuthStore((s) => s.accessToken);
  const { t } = useTranslation();
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

    socket.on('chat:message', (p) => {
      hRef.current.onMessage?.(p as Parameters<NonNullable<ChatHandlers['onMessage']>>[0]);
      // Ovoz + toast — faqat chat oynasi yopiq bo'lsa toast (aksi holda foydalanuvchi allaqachon ko'ryapti).
      playChatSound();
      if (!isChatOpen()) showChatToast((p as { message?: ChatMsgLike }).message, t);
    });
    socket.on('chat:typing', (p) => hRef.current.onTyping?.(p as Parameters<NonNullable<ChatHandlers['onTyping']>>[0]));
    socket.on('chat:conversation-updated', () => hRef.current.onConversationUpdated?.());
    socket.on('connect_error', () => undefined);

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, enabled, t]);

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

/** Qisqa, yumshoq "ding" ovozi (AudioContext orqali — hech qanday fayl kerak emas). */
function playChatSound(): void {
  try {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    const ctx = new Ctor();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
    osc.onended = () => void ctx.close();
  } catch {
    /* audio bloklangan bo'lsa e'tiborsiz qoldiramiz */
  }
}

/** Chat yopiq bo'lganda yangi xabar haqida yumaloq toast. */
function showChatToast(msg: ChatMsgLike | undefined, t: (k: string) => string): void {
  if (!msg?.text) return;
  const senderName =
    typeof msg.sender === 'object' && msg.sender !== null && 'name' in msg.sender && (msg.sender as { name?: string }).name
      ? (msg.sender as { name: string }).name
      : t('chat.support');
  toast(
    <div className="flex items-start gap-2.5">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary-100 text-primary-600">
        <MessageCircle className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-ink-800">{senderName}</p>
        <p className="line-clamp-2 text-sm text-ink-500">{msg.text}</p>
      </div>
    </div>,
    { duration: 5000 },
  );
}

