import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Switch } from '../ui/Switch';
import { SettingsGroup } from './SettingsGroup';
import { SettingsRow } from './SettingsRow';
import { usersApi } from '../../api/users.api';
import type { NotificationPrefs as Prefs } from '../../types';

const ROWS: { key: keyof Prefs; label: string }[] = [
  { key: 'pushEnabled', label: 'Push bildirishnomalar' },
  { key: 'orderUpdates', label: 'Buyurtma yangiliklari' },
  { key: 'promos', label: 'Promo va chegmalar' },
  { key: 'newDishes', label: 'Yangi taomlar' },
  { key: 'systemMessages', label: 'Tizim xabarlari' },
];

export function NotificationPrefs({ prefs }: { prefs: Prefs }) {
  const qc = useQueryClient();
  const mutation = useMutation({
    mutationFn: (patch: Partial<Prefs>) => usersApi.updateNotifPrefs(patch),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['me'] });
      toast.success('Sozlamalar saqlandi');
    },
    onError: () => toast.error('Saqlab bo‘lmadi'),
  });

  return (
    <SettingsGroup title="Bildirishnomalar">
      {ROWS.map((r) => (
        <SettingsRow
          key={r.key}
          label={r.label}
          right={
            <Switch
              checked={Boolean(prefs[r.key])}
              onChange={(v) => mutation.mutate({ [r.key]: v })}
              label={r.label}
            />
          }
        />
      ))}
    </SettingsGroup>
  );
}
