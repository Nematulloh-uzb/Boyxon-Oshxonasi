import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { Switch } from '../ui/Switch';
import { SettingsGroup } from './SettingsGroup';
import { SettingsRow } from './SettingsRow';
import { usersApi } from '../../api/users.api';
import { usePush } from '../../hooks/usePush';
import type { NotificationPrefs as Prefs } from '../../types';

/**
 * Yagona "Sayt bildirishnomalari" switci. pushEnabled = barcha bildirishnomalar
 * (in-app + brauzer push) yoqilganmi. Boshqa kategoriya filtri yo'q.
 */
export function NotificationPrefs({ bare }: { prefs?: Prefs; bare?: boolean }) {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const { supported, permission, subscribed, ready, busy, subscribe, unsubscribe } = usePush();

  // Optimistik holat: bosilishi bilanoq DARHOL aks etadi (SW/server javobini kutmaydi).
  // null = haqiqiy holatga tayanamiz. Faqat haqiqiy holat (subscribed) o'zgarganda tozalanadi.
  const [optimistic, setOptimistic] = useState<boolean | null>(null);

  useEffect(() => {
    setOptimistic(null);
  }, [subscribed]);

  const siteOn = optimistic ?? subscribed;

  const mutation = useMutation({
    mutationFn: (patch: Partial<Prefs>) => usersApi.updateNotifPrefs(patch),
    onSuccess: (_r, vars) => {
      void qc.invalidateQueries({ queryKey: ['me'] });
      if ('pushEnabled' in vars) {
        toast.success(vars.pushEnabled ? t('notifications.push_on') : t('notifications.push_off'));
      } else {
        toast.success(t('settings.saved'));
      }
    },
    onError: () => toast.error(t('settings.save_error')),
  });

  /**
   * Latencysiz: bu funksiya SINXRON — hech qanday await yo'q.
   * Switc bosilishi bilan DARHOL o'zgaradi; subscribe/unsubscribe/server
   * hammasi FON rejimida ketadi. Faqat haqiqiy xatoda optimistik orqaga qaytadi.
   */
  const handleToggle = (v: boolean): void => {
    if (!supported) {
      toast.error(t('notifications.unsupported'));
      return;
    }
    // 1) DARHOL, sinxron — switc shu soniyada o'zgaradi.
    setOptimistic(v);
    if (v) {
      if (permission === 'denied') {
        setOptimistic(null);
        toast.error(t('notifications.push_enable_failed'));
        return;
      }
      // 2) Fon rejimida obuna bo'lish; xato bo'lsa orqaga qaytaramiz.
      void subscribe().then((ok) => {
        if (!ok) {
          setOptimistic(null);
          toast.error(t('notifications.push_enable_failed'));
        }
      });
    } else {
      // 3) Fon rejimida obunani bekor qilish — kutmaymiz.
      void unsubscribe();
      localStorage.setItem('boyxon-push-asked', 'off');
    }
    // Server pref — ham fire-and-forget (React Query o'zi boshqaradi).
    mutation.mutate({ pushEnabled: v });
  };

  const row = (
    <SettingsRow
      label={t('notif.site')}
      right={
        <Switch
          checked={siteOn}
          disabled={!ready}
          pending={busy || mutation.isPending}
          onChange={handleToggle}
          label={t('notif.site')}
        />
      }
    />
  );

  // bare — satrni o'z kartasiz, chaqiruvchi joyning (Bildirishnomalar satri tagida) ichida ko'rsatadi.
  if (bare) return <>{row}</>;

  return <SettingsGroup title={t('settings.notifications')}>{row}</SettingsGroup>;
}
