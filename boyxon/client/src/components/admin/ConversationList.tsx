import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, Search, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { chatApi } from '../../api/chat.api';
import { useChatSocket } from '../../hooks/useChatSocket';
import { useDebounce } from '../../hooks/useDebounce';
import { cn } from '../../lib/utils';
import type { Conversation } from '../../types';

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'now';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

interface Props {
  activeId: string | null;
  onSelect: (id: string) => void;
}

/** Admin — suhbatlar ro'yxati (real-time yangilanadi). */
export function ConversationList({ activeId, onSelect }: Props) {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const debounced = useDebounce(search, 300);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-conversations', debounced],
    queryFn: () => chatApi.conversations(debounced),
    staleTime: Infinity,
  });

  // Yangi xabar/konversatsiya kelganda ro'yxatni yangilaymiz.
  useChatSocket({
    onMessage: () => void qc.invalidateQueries({ queryKey: ['admin-conversations'] }),
    onConversationUpdated: () => void qc.invalidateQueries({ queryKey: ['admin-conversations'] }),
  });

  // "now / 5m" belgilarini yangilab turish uchun.
  useEffect(() => {
    const iv = setInterval(() => void qc.invalidateQueries({ queryKey: ['admin-conversations'] }), 30_000);
    return () => clearInterval(iv);
  }, [qc]);

  const items: Conversation[] = data?.data ?? [];

  return (
    <div className="flex h-full w-full flex-col border-ink-line md:w-80 md:border-r">
      <div className="border-b border-ink-line p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('chat.search')}
            className="h-10 w-full rounded-full border border-ink-line bg-bg pl-9 pr-3 text-sm outline-none focus:border-primary-500"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading && (
          <div className="flex justify-center py-8 text-ink-300">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        )}
        {!isLoading && !items.length && (
          <div className="py-10 text-center text-sm text-ink-300">
            <MessageSquare className="mx-auto mb-2 h-8 w-8" />
            {t('chat.no_conversations')}
          </div>
        )}
        {items.map((c) => {
          const u = c.user as unknown as { _id: string; name: string; avatar?: string | null } | undefined;
          const active = c._id === activeId;
          return (
            <button
              key={c._id}
              onClick={() => onSelect(c._id)}
              className={cn(
                'flex w-full items-center gap-3 border-b border-ink-line/50 px-4 py-3 text-left transition hover:bg-surface-raised',
                active && 'bg-primary-50',
              )}
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary-100 text-sm font-bold text-primary-700">
                {(u?.name ?? '?').charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate font-semibold text-ink-800">{u?.name ?? t('chat.unknown_user')}</p>
                  {c.lastMessageAt && <span className="shrink-0 text-[11px] text-ink-300">{timeAgo(c.lastMessageAt)}</span>}
                </div>
                <p className="truncate text-xs text-ink-300">{c.lastMessage || t('chat.no_messages')}</p>
              </div>
              {c.adminUnread > 0 && (
                <span className="grid h-5 min-w-5 shrink-0 place-items-center rounded-full bg-primary-500 px-1.5 text-[11px] font-bold text-white">
                  {c.adminUnread}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

