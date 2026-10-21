import { useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { chatApi } from '../../api/chat.api';
import { useChatSocket, useChatTyping, setChatOpen, isChatOpen } from '../../hooks/useChatSocket';
import { cn } from '../../lib/utils';
import { useAuthStore } from '../../store/auth.store';
import type { ChatMessage } from '../../types';

function time(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/** Mijoz uchun floating chat widget (support bilan real-time suhbat). */
export function ChatWidget() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const token = useAuthStore((s) => s.accessToken);
  const [open, setOpen] = useState(() => isChatOpen());
  const [draft, setDraft] = useState('');
  const [adminTyping, setAdminTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['chat-me'],
    queryFn: () => chatApi.myConversation(),
    enabled: Boolean(token),
    staleTime: Infinity,
  });

  const messages: ChatMessage[] = data?.data.messages ?? [];
  const conversationId = data?.data.conversation?._id;

  useEffect(() => {
    setChatOpen(open);
  }, [open]);

  const socket = useChatSocket(
    {
      onMessage: () => {
        void qc.invalidateQueries({ queryKey: ['chat-me'] });
      },
      onTyping: () => {
        setAdminTyping(true);
        if (typingTimer.current) clearTimeout(typingTimer.current);
        typingTimer.current = setTimeout(() => setAdminTyping(false), 2500);
      },
    },
    Boolean(token),
  );
  const emitTyping = useChatTyping(socket);

  useEffect(() => {
    if (open) scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length, adminTyping, open]);

  const send = (): void => {
    const text = draft.trim();
    if (!text) return;
    setDraft('');
    const optimistic: ChatMessage = {
      _id: `tmp-${Date.now()}`,
      conversation: conversationId ?? '',
      sender: 'me',
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
      .then(() => void qc.invalidateQueries({ queryKey: ['chat-me'] }))
      .catch(() => void qc.invalidateQueries({ queryKey: ['chat-me'] }));
  };

  if (!token) return null;


  return (
    <>
      {/* Yopiq holat — floating tugma (mobil: pastki nav panelidan tepada) */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-20 right-5 z-40 grid h-12 w-12 place-items-center rounded-full bg-gradient-to-r from-primary-700 to-primary-800 text-white shadow-lg transition hover:scale-105 active:scale-95 sm:bottom-5"
          aria-label={t('chat.open')}
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {/* Ochiq chat oynasi */}
      {open && (
        <div className="fixed bottom-0 right-0 z-40 flex h-[100dvh] w-full flex-col bg-surface shadow-2xl sm:bottom-5 sm:right-5 sm:h-[560px] sm:max-h-[85vh] sm:w-[380px] sm:rounded-3xl sm:border sm:border-ink-line">
          {/* Sarlavha */}
          <div className="flex items-center gap-3 rounded-t-3xl bg-gradient-to-r from-primary-700 to-primary-800 px-4 py-3 text-white">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/20">
              <MessageCircle className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{t('chat.support')}</p>
              <p className="flex items-center gap-1.5 text-xs text-white">
                <span className="h-2 w-2 rounded-full bg-green-300" />
                {t('chat.online')}
              </p>
            </div>
            <button onClick={() => setOpen(false)} className="rounded-full p-1.5 hover:bg-white/20" aria-label={t('common.close')}>
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Xabarlar */}
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-bg p-4">
            {isLoading && (
              <div className="flex h-full items-center justify-center text-ink-300">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            )}
            {!isLoading && !messages.length && (
              <div className="py-10 text-center">
                <MessageCircle className="mx-auto h-10 w-10 text-ink-300" />
                <p className="mt-2 text-sm text-ink-300">{t('chat.welcome')}</p>
              </div>
            )}
            {messages.map((m) => {
              const mine = m.senderRole === 'user';
              return (
                <div key={m._id} className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
                  <div
                    className={cn(
                      'max-w-[80%] rounded-2xl px-3.5 py-2 text-sm shadow-sm',
                      mine
                        ? 'rounded-br-md bg-gradient-to-r from-primary-700 to-primary-800 text-white'
                        : 'rounded-bl-md bg-surface-raised text-ink-800',
                    )}
                  >
                    <p className="whitespace-pre-wrap break-words">{m.text}</p>
                    <p className={cn('mt-1 text-[10px]', mine ? 'text-white' : 'text-ink-300')}>{time(m.createdAt)}</p>
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

          {/* Yozish maydoni */}
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
                emitTyping('admin');
              }}
              placeholder={t('chat.placeholder')}
              className="h-11 flex-1 rounded-full border border-ink-line bg-bg px-4 text-sm outline-none focus:border-primary-500"
            />
            <button
              type="submit"
              disabled={!draft.trim()}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-r from-primary-700 to-primary-800 text-white transition disabled:opacity-40"
              aria-label={t('chat.send')}
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
