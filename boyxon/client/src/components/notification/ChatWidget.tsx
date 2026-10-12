import { useEffect, useRef, useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { MessageCircle, Send, X, Loader2, Headset } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import { chatApi } from '../../api/chat.api';
import { useUiStore } from '../../store/ui.store';
import { useAuthStore } from '../../store/auth.store';
import { useChatSocket, useChatTyping } from '../../hooks/useChatSocket';
import { cn } from '../../lib/utils';
import type { ChatMessage } from '../../types';

function time(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function Bubble({ m }: { m: ChatMessage }) {
  const mine = m.senderRole === 'user';
  return (
    <div className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[78%] rounded-2xl px-3.5 py-2 text-sm shadow-sm',
          mine
            ? 'rounded-br-md bg-gradient-to-r from-[#E67E22] to-[#F39C12] text-white'
            : 'rounded-bl-md bg-surface-raised text-ink-800',
        )}
      >
        <p className="whitespace-pre-wrap break-words">{m.text}</p>
        <p className={cn('mt-1 text-[10px]', mine ? 'text-white/70' : 'text-ink-300')}>{time(m.createdAt)}</p>
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-1 rounded-2xl rounded-bl-md bg-surface-raised px-4 py-3">
        <span className="h-2 w-2 animate-bounce rounded-full bg-ink-300 [animation-delay:-0.3s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-ink-300 [animation-delay:-0.15s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-ink-300" />
      </div>
    </div>
  );
}

/**
 * User uchun real-time chat — floating tugma + ochiladigan chat oynasi.
 * Faqat login bo'lganda ko'rinadi. Admin bilan to'g'ridan-to'g'ri yozishadi.
 */
export function ChatWidget() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const { chatOpen, set } = useUiStore();
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.accessToken);
  const [draft, setDraft] = useState('');
  const [adminTyping, setAdminTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const myId = user?._id;

  const { data, isLoading } = useQuery({
    queryKey: ['chat-me'],
    queryFn: () => chatApi.myConversation(),
    enabled: Boolean(token) && chatOpen,
    staleTime: Infinity,
  });

  const messages: ChatMessage[] = data?.data.messages ?? [];

  const invalidate = useCallback(() => {
    void qc.invalidateQueries({ queryKey: ['chat-me'] });
  }, [qc]);

  const socket = useChatSocket({
    onMessage: (p) => {
      const msg = p.message as ChatMessage | undefined;
      if (msg?._id) {
        qc.setQueryData<{ data: { conversation: unknown; messages: ChatMessage[] } } | undefined>(
          ['chat-me'],
          (old) => (old ? { ...old, data: { ...old.data, messages: [...old.data.messages, msg] } } : old),
        );
      }
      setAdminTyping(false);
      invalidate();
    },
    onTyping: () => {
      setAdminTyping(true);
      if (typingTimer.current) clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(() => setAdminTyping(false), 2500);
    },
  });
  const emitTyping = useChatTyping(socket);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length, adminTyping]);

  if (!token) return null;

  const send = (): void => {
    const text = draft.trim();
    if (!text) return;
    setDraft('');
    const optimistic: ChatMessage = {
      _id: `tmp-${Date.now()}`,
      conversation: '',
      sender: myId ?? '',
      senderRole: 'user',
      text,
      readAt: null,
      createdAt: new Date().toISOString(),
    };
    qc.setQueryData<{ data: { conversation: unknown; messages: ChatMessage[] } } | undefined>(
      ['chat-me'],
      (old) => (old ? { ...old, data: { ...old.data, messages: [...old.data.messages, optimistic] } } : old),
    );
    chatApi
      .sendUserMessage(text)
      .then(() => invalidate())
      .catch(() => {
        toast.error(t('chat.send_error'));
        invalidate();
      });
  };

