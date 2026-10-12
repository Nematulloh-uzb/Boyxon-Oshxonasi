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
  return (
    <>
      {/* Floating tugma */}
      <AnimatePresence>
        {!chatOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => set({ chatOpen: true })}
            className="fixed bottom-20 right-4 z-40 grid h-14 w-14 place-items-center rounded-full bg-gradient-to-r from-[#E67E22] to-[#F39C12] text-white shadow-lg shadow-primary-500/30 transition hover:brightness-110 md:bottom-6"
            aria-label={t('chat.open')}
          >
            <MessageCircle className="h-6 w-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat oynasi */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed inset-x-4 bottom-20 z-50 flex h-[70vh] max-h-[560px] flex-col overflow-hidden rounded-3xl border border-ink-line bg-surface shadow-2xl md:inset-x-auto md:bottom-6 md:right-6 md:h-[520px] md:w-[380px]"
          >
            <div className="flex items-center gap-3 border-b border-ink-line bg-gradient-to-r from-[#E67E22] to-[#F39C12] px-4 py-3 text-white">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-white/20">
                <Headset className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display font-bold">{t('chat.title')}</p>
                <p className="text-xs text-white/80">{t('chat.subtitle')}</p>
              </div>
              <button onClick={() => set({ chatOpen: false })} className="rounded-full p-1.5 hover:bg-white/20" aria-label={t('common.close')}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-bg p-4">
              {isLoading && (
                <div className="flex h-full items-center justify-center text-ink-300">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              )}
              {!isLoading && !messages.length && (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <span className="grid h-14 w-14 place-items-center rounded-full bg-primary-100 text-primary-600">
                    <MessageCircle className="h-7 w-7" />
                  </span>
                  <p className="mt-3 text-sm font-semibold text-ink-700">{t('chat.welcome_title')}</p>
                  <p className="mt-1 max-w-[240px] text-xs text-ink-300">{t('chat.welcome_desc')}</p>
                </div>
              )}
              {messages.map((m) => (
                <Bubble key={m._id} m={m} />
              ))}
              {adminTyping && <TypingDots />}
            </div>

            <form
              className="flex items-center gap-2 border-t border-ink-line bg-surface p-3"
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
            >
              <input
                value={draft}
                onChange={(e) => {
                  setDraft(e.target.value);
                  emitTyping();
                }}
                placeholder={t('chat.placeholder')}
                className="h-11 flex-1 rounded-full border border-ink-line bg-bg px-4 text-sm outline-none focus:border-primary-500"
              />
              <button
                type="submit"
                disabled={!draft.trim()}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-r from-[#E67E22] to-[#F39C12] text-white transition disabled:opacity-40"
                aria-label={t('chat.send')}
              >
                <Send className="h-5 w-5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}


