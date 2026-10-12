import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { Switch } from '../ui/Switch';
import { SettingsGroup } from './SettingsGroup';
import { SettingsRow } from './SettingsRow';
import { usersApi } from '../../api/users.api';
import { usePush } from '../../hooks/usePush';
import type { NotificationPrefs as Prefs } from '../../types';

/**
 * Yagona "Sayt bildirishnomalari" switci. pushEnabled = barcha bildirishnomalar
 * (in-app + brauzer push) yoqilganmi. Boshqa kategoriya filtri yo'q.
 *
 * Latency: switch bosilganda serverdan javob kelguncha KUTADI — shu vaqtda
 * disabled + biroz o'chganroq (opacity) ko'rinadi. Javob kelgach haqiqiy holatga o'tadi.
 */
export function NotificationPrefs({ bare }: { prefs?: Prefs; bare?: boolean }) {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const { supported, permission, subscribed, ready, busy, subscribe, unsubscribe } = usePush();

  // Haqiqiy holat — brauzer obunasi (usePush subscribe/unsubscribe tugagach yangilaydi).
  const siteOn = subscribed;

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
   * Latency (kerakli): switch DARHOL qirmaydi — serverdan (brauzer obunasi)
   * javob kelguncha kutadi. Shu orada switch disabled + opacity-60 ko'rinadi.
   * Ikkala tomonda ham (yoqish/o'chirish) bir xil.
   */
  const handleToggle = (v: boolean): void => {
    if (!supported) {
      toast.error(t('notifications.unsupported'));
      return;
    }
    if (v) {
      if (permission === 'denied') {
        toast.error(t('notifications.push_enable_failed'));
        return;
      }
      // Obuna bo'lishni kutamiz; tugagach usePush subscribed=true qiladi.
      void subscribe().then((ok) => {
        if (!ok) toast.error(t('notifications.push_enable_failed'));
      });
    } else {
      // Obunani bekor qilishni kutamiz; tugagach usePush subscribed=false qiladi.
      void unsubscribe();
      localStorage.setItem('boyxon-push-asked', 'off');
    }
    // Server pref — ham yuboriladi (React Query o'zi boshqaradi).
    mutation.mutate({ pushEnabled: v });
  };

  // So'rov ketayotganda: disabled (bosilmaydi) + biroz o'chganroq (opacity-60).
  const pending = busy || mutation.isPending;

  const row = (
    <SettingsRow
      label={t('notif.site')}
      right={
        <Switch
          checked={siteOn}
          disabled={!ready || pending}
          pending={pending}
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
