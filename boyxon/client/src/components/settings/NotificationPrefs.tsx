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

const ROWS: { key: keyof Prefs; k: string }[] = [
  { key: 'orderUpdates', k: 'notif.orders' },
  { key: 'promos', k: 'notif.promos' },
  { key: 'newDishes', k: 'notif.dishes' },
  { key: 'systemMessages', k: 'notif.system' },
];

export function NotificationPrefs({ prefs, bare }: { prefs: Prefs; bare?: boolean }) {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const { supported, permission, subscribed, ready, subscribe, unsubscribe } = usePush();

  // Optimistik holat: bosilishi bilanoq DARHOL aks etadi (SW/server javobini kutmaydi).
  // null = haqiqiy holatga tayanamiz. Faqat haqiqiy holat (subscribed) o'zgarganda tozalanadi.
  const [optimistic, setOptimistic] = useState<boolean | null>(null);

  useEffect(() => {
    setOptimistic(null);
  }, [subscribed]);

  // "Sayt bildirishnomalari" — umumiy master (push obunasi). Uni o'chirsangiz hech narsa kelmaydi.
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
  const handleToggle = (key: keyof Prefs, v: boolean): void => {
    if (key === 'pushEnabled') {
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
    }
    // Server pref — ham fire-and-forget (React Query o'zi boshqaradi).
    mutation.mutate({ [key]: v });
  };

  // Umumiy master satr — "Sayt bildirishnomalari".
  const master = (
    <SettingsRow
      label={t('notif.site')}
      right={
        <Switch
          checked={siteOn}
          disabled={!ready}
          onChange={(v) => handleToggle('pushEnabled', v)}
          label={t('notif.site')}
        />
      }
    />
  );

  // Ichkaridagi filtrlar — master o'chsa ular disabled ko'rinadi.
  const nested = ROWS.map((r) => (
    <SettingsRow
      key={r.key}
      label={t(r.k)}
      right={
        <Switch
          checked={Boolean(prefs[r.key])}
          disabled={!siteOn}
          onChange={(v) => handleToggle(r.key, v)}
          label={t(r.k)}
        />
      }
    />
  ));

  // bare — SettingsRowsni o'z kartasiz, chaqiruvchi joyning (satr tagida) ichida ko'rsatadi.
  if (bare) {
    return (
      <>
        {master}
        <div className="border-t border-ink-line/40 bg-surface-raised/40 px-4 pl-12">
          {nested}
        </div>
      </>
    );
  }

  return (
    <SettingsGroup title={t('settings.notifications')}>
      {master}
      <div className="border-t border-ink-line/40 bg-surface-raised/40 px-4 pl-12">{nested}</div>
    </SettingsGroup>
  );
}
