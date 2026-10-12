import { useEffect, useRef, useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { chatApi } from '../../api/chat.api';
import { useChatSocket, useChatTyping } from '../../hooks/useChatSocket';
import { cn } from '../../lib/utils';
import type { ChatMessage, ChatUser } from '../../types';

import type { ChatConversation } from '../../types';

interface ThreadData {
  success: boolean;
  message: string;
  data: { conversation: ChatConversation; messages: ChatMessage[] };
}

function time(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/** Admin uchun bitta suhbat xabar oynasi. */
export function ChatThread({ conversationId, onBack }: { conversationId: string; onBack: () => void }) {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [draft, setDraft] = useState('');
  const [userTyping, setUserTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-conversation', conversationId],
    queryFn: () => chatApi.conversation(conversationId),
    staleTime: Infinity,
  });

  const messages: ChatMessage[] = data?.data.messages ?? [];
  const user = (data?.data.conversation.user ?? null) as ChatUser | null;

  const invalidate = useCallback(() => {
    void qc.invalidateQueries({ queryKey: ['admin-conversation', conversationId] });
    void qc.invalidateQueries({ queryKey: ['admin-conversations'] });
  }, [qc, conversationId]);

  const socket = useChatSocket({
    onMessage: (p) => {
      const msg = p.message as ChatMessage | undefined;
      if (msg?._id) {
        qc.setQueryData<ThreadData | undefined>(['admin-conversation', conversationId], (old) =>
          old ? { ...old, data: { ...old.data, messages: [...old.data.messages, msg] } } : old,
        );
      }
      setUserTyping(false);
      invalidate();
    },
    onTyping: () => {
      setUserTyping(true);
      if (typingTimer.current) clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(() => setUserTyping(false), 2500);
    },
  });
  const emitTyping = useChatTyping(socket);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length, userTyping]);

  const send = (): void => {
    const text = draft.trim();
    if (!text) return;
    setDraft('');
    const optimistic: ChatMessage = {
      _id: `tmp-${Date.now()}`,
      conversation: conversationId,
      sender: 'me',
      senderRole: 'admin',
      text,
      readAt: null,
      createdAt: new Date().toISOString(),
    };
    qc.setQueryData<ThreadData | undefined>(['admin-conversation', conversationId], (old) =>
      old ? { ...old, data: { ...old.data, messages: [...old.data.messages, optimistic] } } : old,
    );
    chatApi.sendAdminMessage(conversationId, text).then(invalidate).catch(() => {
      toast.error(t('chat.send_error'));
      invalidate();
    });
  };