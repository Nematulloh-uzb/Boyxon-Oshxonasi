import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { Switch } from '../ui/Switch';
import { SettingsGroup } from './SettingsGroup';
import { SettingsRow } from './SettingsRow';
import { usersApi } from '../../api/users.api';
import type { NotificationPrefs as Prefs } from '../../types';

const ROWS: { key: keyof Prefs; k: string }[] = [
  { key: 'pushEnabled', k: 'notif.push' },
  { key: 'orderUpdates', k: 'notif.orders' },
  { key: 'promos', k: 'notif.promos' },
  { key: 'newDishes', k: 'notif.dishes' },
  { key: 'systemMessages', k: 'notif.system' },
];

export function NotificationPrefs({ prefs }: { prefs: Prefs }) {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: (patch: Partial<Prefs>) => usersApi.updateNotifPrefs(patch),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['me'] });
      toast.success(t('settings.saved'));
    },
    onError: () => toast.error(t('settings.save_error')),
  });

  return (
    <SettingsGroup title={t('settings.notifications')}>
      {ROWS.map((r) => (
        <SettingsRow
          key={r.key}
          label={t(r.k)}
          right={
            <Switch
              checked={Boolean(prefs[r.key])}
              onChange={(v) => mutation.mutate({ [r.key]: v })}
              label={t(r.k)}
            />
          }
        />
      ))}
    </SettingsGroup>
  );
}
