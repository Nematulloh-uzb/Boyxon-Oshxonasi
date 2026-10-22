import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../lib/utils';

interface UserAvatarProps {
  src?: string | null;
  name?: string | null;
  className?: string;
  /** Rasmni bosganda kattaroq ko'rish oynasini ochish. */
  viewable?: boolean;
}

/** Profil rasmi — rasm yo'q yoki yuklanmasa, ismning birinchi harfi ko'rsatiladi. */
export function UserAvatar({ src, name, className, viewable = false }: UserAvatarProps) {
  const { t } = useTranslation();
  const [failed, setFailed] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setFailed(false);
    setOpen(false);
  }, [src]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') setOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const initial = (name?.trim().charAt(0) || '?').toUpperCase();
  const showImage = Boolean(src) && !failed;
  const label = name ? `${name} — rasmni ko‘rish` : 'Rasmni ko‘rish';

  const avatarContent = showImage ? (
    <img
      src={src ?? undefined}
      alt={name ?? ''}
      className="h-full w-full object-cover"
      referrerPolicy="no-referrer"
      decoding="async"
      draggable={false}
      onError={() => setFailed(true)}
    />
  ) : (
    initial
  );

  const avatar = viewable && showImage ? (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className={cn(
        'grid h-10 w-10 shrink-0 cursor-zoom-in place-items-center overflow-hidden rounded-full border-0 bg-primary-100 p-0 text-sm font-bold text-primary-700 transition hover:ring-2 hover:ring-primary-500/60',
        className,
      )}
      aria-label={label}
      title={label}
    >
      {avatarContent}
    </button>
  ) : (
    <span
      className={cn(
        'grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-primary-100 text-sm font-bold text-primary-700',
        className,
      )}
    >
      {avatarContent}
    </span>
  );

  return (
    <>
      {avatar}
      {open &&
        showImage &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] grid place-items-center bg-black/85 p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-label={label}
            onClick={() => setOpen(false)}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/15 text-white transition hover:bg-white/25"
              aria-label={t('common.close')}
            >
              <X className="h-5 w-5" />
            </button>
            <img
              src={src ?? undefined}
              alt={name ?? ''}
              className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl"
              referrerPolicy="no-referrer"
              draggable={false}
              onClick={(e) => e.stopPropagation()}
            />
          </div>,
          document.body,
        )}
    </>
  );
}
