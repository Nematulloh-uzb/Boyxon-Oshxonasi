import { useEffect, useRef, useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { X, Send, MessageCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { chatApi } from '../../api/chat.api';
import { useChatSocket, useChatTyping, setChatOpen } from '../../hooks/useChatSocket';
import { cn } from '../../lib/utils';
import type { ChatMessage } from '../../types';

function time(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/** Mijoz uchun chat widgeti — sahifada suzuvchi oyna. */
export function UserChat({ onClose }: { onClose: () => void }) {
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

  const invalidate = useCallback(() => {
    void qc.invalidateQueries({ queryKey: ['my-conversation'] });
  }, [qc]);

  const socket = useChatSocket({
    onMessage: (p) => {
      const msg = p.message as ChatMessage | undefined;
      if (msg?._id) {
        qc.setQueryData<{ data: { conversation: unknown; messages: ChatMessage[] } } | undefined>(
          ['my-conversation'],
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