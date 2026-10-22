import { useEffect, useState } from 'react';
import { cn } from '../../lib/utils';

interface UserAvatarProps {
  src?: string | null;
  name?: string | null;
  className?: string;
}

/** Profil rasmi — rasm yo'q yoki yuklanmasa, ismning birinchi harfi ko'rsatiladi. */
export function UserAvatar({ src, name, className }: UserAvatarProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  const initial = (name?.trim().charAt(0) || '?').toUpperCase();
  const showImage = Boolean(src) && !failed;

  return (
    <span
      className={cn(
        'grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-primary-100 text-sm font-bold text-primary-700',
        className,
      )}
    >
      {showImage ? (
        <img
          src={src ?? undefined}
          alt={name ?? ''}
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        initial
      )}
    </span>
  );
}
