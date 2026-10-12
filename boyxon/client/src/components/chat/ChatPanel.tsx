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
