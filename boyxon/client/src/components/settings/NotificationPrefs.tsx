import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { Switch } from '../ui/Switch';
import { SettingsGroup } from './SettingsGroup';
import { SettingsRow } from './SettingsRow';
import { usersApi } from '../../api/users.api';
import { usePush } from '../../hooks/usePush';
import type { NotificationPrefs as Prefs } from '../../types';

const ROWS: { key: keyof Prefs; k: string }[] = [
  { key: 'pushEnabled', k: 'notif.push' },
  { key: 'orderUpdates', k: 'notif.orders' },
  { key: 'promos', k: 'notif.promos' },
  { key: 'newDishes', k: 'notif.dishes' },
  { key: 'systemMessages', k: 'notif.system' },
];

export function NotificationPrefs({ prefs, bare }: { prefs: Prefs; bare?: boolean }) {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const { supported, subscribe, unsubscribe } = usePush();

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
   * Push switci — haqiqiy brauzer obunasini boshqaradi:
   * YOQISH → ruxsat + PushManager.subscribe + serverga saqlash;
   * O'CHIRISH → serverdan o'chirish + brauzer obunani bekor qilish.
   * Boshqa switclar — faqat server pref'i.
   */
  const handleToggle = async (key: keyof Prefs, v: boolean): Promise<void> => {
    if (key === 'pushEnabled') {
      if (!supported) {
        toast.error(t('notifications.unsupported'));
        return;
      }
      if (v) {
        const okSub = await subscribe();
        if (!okSub) {
          toast.error(t('notifications.push_enable_failed'));
          return;
        }
      } else {
        await unsubscribe();
        // Qayta so'ralmaslik uchun — qayta yoqish Sozlamalar orqali bo'ladi.
        localStorage.setItem('boyxon-push-asked', 'off');
      }
    }
    mutation.mutate({ [key]: v });
  };

  const rows = ROWS.map((r) => (
    <SettingsRow
      key={r.key}
      label={t(r.k)}
      right={
        <Switch
          checked={Boolean(prefs[r.key])}
          onChange={(v) => void handleToggle(r.key, v)}
          label={t(r.k)}
        />
      }
    />
  ));

  // bare — SettingsRowsni o'z kartasiz, chaqiruvchi joyning (satr tagida) ichida ko'rsatadi.
  if (bare) return <>{rows}</>;

  return <SettingsGroup title={t('settings.notifications')}>{rows}</SettingsGroup>;
}
