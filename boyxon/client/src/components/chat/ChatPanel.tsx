import { useEffect, useRef, useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Send, X, Loader2, MessageCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { chatApi } from '../../api/chat.api';
import { useChatSocket, useChatTyping } from '../../hooks/useChatSocket';
import { cn } from '../../lib/utils';
import type { ChatMessage } from '../../types';

interface ThreadData {
  success: boolean;
  message: string;
  data: { conversation: { _id: string }; messages: ChatMessage[] };
}

function time(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/** Foydalanuvchi uchun suhbat oynasi (admin bilan real-time). */
export function ChatPanel({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [draft, setDraft] = useState('');
  const [adminTyping, setAdminTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['my-conversation'],
    queryFn: () => chatApi.myConversation(),
    staleTime: Infinity,
  });

  const messages: ChatMessage[] = data?.data.messages ?? [];

  const socket = useChatSocket({
    onMessage: (p) => {
      const msg = p.message as ChatMessage | undefined;
      if (msg?._id) {
        qc.setQueryData<ThreadData>(['my-conversation'], (old) =>
          old ? { ...old, data: { ...old.data, messages: [...old.data.messages, msg] } } : old,
        );
      }
      setAdminTyping(false);
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

  const send = useCallback((): void => {
    const text = draft.trim();
    if (!text) return;
    setDraft('');
    const optimistic: ChatMessage = {
      _id: `tmp-${Date.now()}`,
      conversation: data?.data.conversation._id ?? '',
      sender: 'me',
      senderRole: 'user',
      text,
      readAt: null,
      createdAt: new Date().toISOString(),
    };
    qc.setQueryData<ThreadData>(['my-conversation'], (old) =>
      old ? { ...old, data: { ...old.data, messages: [...old.data.messages, optimistic] } } : old,
    );
    chatApi
      .sendUserMessage(text)
      .then(() => void qc.invalidateQueries({ queryKey: ['my-conversation'] }))
      .catch(() => {
        toast.error(t('chat.send_error'));
        void qc.invalidateQueries({ queryKey: ['my-conversation'] });
      });
  }, [draft, data, qc, t]);


  return (
    <div className="fixed inset-x-0 bottom-0 top-0 z-50 flex flex-col bg-surface sm:inset-auto sm:bottom-6 sm:right-6 sm:h-[70vh] sm:max-h-[600px] sm:w-[380px] sm:rounded-3xl sm:shadow-2xl sm:ring-1 sm:ring-black/5">
      <div className="flex items-center gap-3 border-b border-ink-line bg-gradient-to-r from-[#E67E22] to-[#F39C12] px-4 py-3 sm:rounded-t-3xl">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-white/20 text-white">
          <MessageCircle className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display font-bold text-white">{t('chat.support_title')}</p>
          <p className="text-xs text-white/80">{t('chat.online')}</p>
        </div>
        <button onClick={onClose} className="rounded-full p-1.5 text-white/90 hover:bg-white/20" aria-label={t('common.close')}>
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
          <div className="py-8 text-center text-sm text-ink-300">{t('chat.start_hint')}</div>
        )}
        {messages.map((m) => {
          const mine = m.senderRole === 'user';
          return (
            <div key={m._id} className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
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
        })}
        {adminTyping && (
          <div className="flex justify-start">
            <div className="flex items-center gap-1 rounded-2xl rounded-bl-md bg-surface-raised px-4 py-3">
              <span className="h-2 w-2 animate-bounce rounded-full bg-ink-300 [animation-delay:-0.3s]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-ink-300 [animation-delay:-0.15s]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-ink-300" />
            </div>
          </div>
        )}
      </div>

      <form
        className="flex items-center gap-2 border-t border-ink-line p-3"
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
    </div>
  );
}
