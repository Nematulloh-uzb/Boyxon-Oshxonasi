import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/auth.store';
import { ChatPanel } from './ChatPanel';

/** Floating chat tugmasi — login bo'lgan userga admin bilan chatni ochadi. */
export function ChatWidget() {
  const { t } = useTranslation();
  const accessToken = useAuthStore((s) => s.accessToken);
  const role = useAuthStore((s) => s.user?.role);
  const [open, setOpen] = useState(false);

  // Faqat login bo'lgan oddiy foydalanuvchilar uchun (admin alohida /admin/chat sahifasida).
  if (!accessToken || role === 'admin') return null;

  return (
    <>
      {open && <ChatPanel onClose={() => setOpen(false)} />}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-20 right-4 z-40 grid h-14 w-14 place-items-center rounded-full bg-gradient-to-r from-[#E67E22] to-[#F39C12] text-white shadow-lg transition hover:brightness-110 active:scale-95 md:bottom-6"
        aria-label={t('chat.open')}
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    </>
  );
}
