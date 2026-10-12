import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { chatApi } from '../../api/chat.api';
import { useAuthStore } from '../../store/auth.store';
import { UserChat } from './UserChat';

/** Mijoz uchun suzuvchi chat tugmasi — o'qilmagan xabar belgisi bilan. */
export function UserChatButton() {
  const { t } = useTranslation();
  const token = useAuthStore((s) => s.accessToken);
  const [open, setOpen] = useState(false);

  // O'qilmagan xabarlar soni (admin yuborgan, user ko'rmagan).
  const { data } = useQuery({
    queryKey: ['my-conversation-badge'],
    queryFn: () => chatApi.myConversation().then((r) => r.data.conversation.userUnread),
    enabled: Boolean(token) && !open,
    refetchInterval: 15_000,
  });

  const unread = data ?? 0;
  if (open) return <UserChat onClose={() => setOpen(false)} />;

  return (
    <button
      onClick={() => setOpen(true)}
      className="fixed bottom-20 right-4 z-40 grid h-14 w-14 place-items-center rounded-full bg-gradient-to-r from-[#E67E22] to-[#F39C12] text-white shadow-lg transition hover:scale-105 active:scale-95 md:bottom-6"
      aria-label={t('chat.open')}
    >
      <MessageCircle className="h-6 w-6" />
      {unread > 0 && (
        <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-danger px-1 text-[11px] font-bold text-white">
          {unread > 9 ? '9+' : unread}
        </span>
      )}
    </button>
  );
}
