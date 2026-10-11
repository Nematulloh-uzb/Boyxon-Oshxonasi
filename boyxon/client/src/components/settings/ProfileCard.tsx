import { useRef } from 'react';
import { Camera, User } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import type { User as UserType } from '../../types';
import { Card } from '../ui/Card';
import { usersApi } from '../../api/users.api';
import { useAuthStore } from '../../store/auth.store';
import { formatPrice } from '../../lib/format';

export function ProfileCard({ user }: { user: UserType }) {
  const { t } = useTranslation();
  const setUser = useAuthStore((s) => s.setUser);
  const fileRef = useRef<HTMLInputElement>(null);

  const onPick = async (file?: File): Promise<void> => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error(t('profile.image_too_large')); return; }
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const r = await usersApi.updateMe({ avatar: String(reader.result) });
        setUser(r.data);
        toast.success(t('profile.avatar_updated'));
      } catch {
        toast.error(t('profile.avatar_error'));
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <Card className="flex items-center gap-4 p-4">
      <div className="relative">
        {user.avatar ? (
          <img src={user.avatar} alt={user.name} className="h-16 w-16 rounded-full object-cover" />
        ) : (
          <div className="grid h-16 w-16 place-items-center rounded-full bg-primary-100 text-primary-600">
            <User className="h-8 w-8" />
          </div>
        )}
        <button
          onClick={() => fileRef.current?.click()}
          className="absolute -bottom-1 -right-1 grid h-8 w-8 place-items-center rounded-full border border-ink-line bg-surface text-ink-700 shadow-sm hover:bg-surface-raised"
          aria-label="Avatar yuklash"
        >
          <Camera className="h-4 w-4" />
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => void onPick(e.target.files?.[0])}
        />
      </div>
      <div className="min-w-0">
        <p className="truncate font-display text-lg font-bold text-ink-900">{user.name}</p>
        <p className="truncate text-sm text-ink-300">{user.email}</p>
        <p className="mt-0.5 text-sm font-medium text-primary-600">Bonus: {user.bonusBalance.toLocaleString('uz-UZ')} so‘m</p>
      </div>
    </Card>
  );
}
