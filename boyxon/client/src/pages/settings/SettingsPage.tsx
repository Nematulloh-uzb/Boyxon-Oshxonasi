import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Bell, Globe, LogOut, MapPin, Moon, Package, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { ProfileCard } from '../../components/settings/ProfileCard';
import { SettingsGroup } from '../../components/settings/SettingsGroup';
import { SettingsRow } from '../../components/settings/SettingsRow';
import { NotificationPrefs } from '../../components/settings/NotificationPrefs';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { useAuthStore } from '../../store/auth.store';
import { usersApi } from '../../api/users.api';
import { ordersApi } from '../../api/orders.api';
import { formatDate, formatPrice } from '../../lib/format';

const LANGS: { v: 'uz' | 'ru' | 'en'; l: string }[] = [
  { v: 'uz', l: "O'zbekcha" },
  { v: 'ru', l: 'Русский' },
  { v: 'en', l: 'English' },
];

export default function SettingsPage() {
  const { t, i18n } = useTranslation();
  const { user, setUser, logout } = useAuthStore();
  const qc = useQueryClient();
  const nav = useNavigate();

  const { data: orders } = useQuery({
    queryKey: ['orders'],
    queryFn: () => ordersApi.myOrders(1, 5),
  });

  if (!user) return <div className="grid min-h-[50vh] place-items-center text-ink-300">{t('common.loading')}</div>;

  const setLang = async (v: 'uz' | 'ru' | 'en'): Promise<void> => {
    void i18n.changeLanguage(v);
    localStorage.setItem('boyxon-lang', v);
    const r = await usersApi.updatePrefs({ language: v });
    setUser({ ...user, preferences: r.data });
    toast.success(t('settings.language_updated'));
  };

  const toggleTheme = async (): Promise<void> => {
    const theme = user.preferences.theme === 'dark' ? 'light' : 'dark';
    // LocalStorage'ni darrov yangilash — sahifa refresh'da ham saqlanadi
    localStorage.setItem('boyxon-theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
    const r = await usersApi.updatePrefs({ theme });
    setUser({ ...user, preferences: r.data });
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-5">
      <h1 className="font-display text-2xl font-extrabold">{t('nav.settings')}</h1>
      <ProfileCard user={user} />

      <SettingsGroup title={t('settings.account')}>
        <SettingsRow icon={MapPin} label={t('settings.addresses')} value={t('home.items_count', { count: user.addresses.length })} onClick={() => toast.info(t('settings.addresses_soon'))} />
        <SettingsRow icon={Package} label={t('settings.orders')} value={orders ? t('home.items_count', { count: orders.pagination.total }) : '...'} onClick={() => toast.info(t('settings.orders_hint'))} />
        <SettingsRow icon={Bell} label={t('settings.notifications')} onClick={() => toast.info(t('settings.bell_hint'))} />
      </SettingsGroup>

      <SettingsGroup title={t('settings.preferences')}>
        <SettingsRow
          icon={Globe}
          label={t('settings.language')}
          right={
            <div className="flex gap-1">
              {LANGS.map((l) => (
                <button
                  key={l.v}
                  onClick={() => void setLang(l.v)}
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${i18n.language === l.v ? 'bg-primary-500 text-white' : 'bg-surface-raised text-ink-700'}`}
                >
                  {l.v.toUpperCase()}
                </button>
              ))}
            </div>
          }
        />
        <SettingsRow
          icon={user.preferences.theme === 'dark' ? Moon : Sun}
          label={t('settings.theme')}
          value={user.preferences.theme === 'dark' ? t('theme.dark') : t('theme.light')}
          right={
            <button onClick={() => void toggleTheme()} className="text-primary-600 text-sm font-semibold">
              {t('settings.toggle')}
            </button>
          }
        />
      </SettingsGroup>

      <NotificationPrefs prefs={user.notificationPrefs} />

      <SettingsGroup title={t('settings.security')}>
        <SettingsRow
          icon={LogOut}
          label={t('auth.logout')}
          danger
          onClick={() => {
            logout();
            void qc.invalidateQueries();
            nav('/');
          }}
        />
      </SettingsGroup>

      {/* Buyurtmalar tarixi */}
      <section>
        <h2 className="mb-2 px-1 text-sm font-semibold uppercase tracking-wide text-ink-300">{t('settings.recent_orders')}</h2>
        <div className="space-y-2">
          {!orders?.data.length && <Card className="p-4 text-sm text-ink-300">{t('settings.no_orders')}</Card>}
          {orders?.data.map((o) => (
            <Card key={o._id} className="flex items-center justify-between p-4">
              <div>
                <p className="font-semibold">{o.orderNumber}</p>
                <p className="text-xs text-ink-300">{formatDate(o.createdAt)} · {t('settings.dishes_count', { count: o.items.length })}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-primary-600">{formatPrice(o.total)}</p>
                <p className="text-xs text-ink-300">{t(`status.${o.status}`)}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <div className="pb-4">
        <Button variant="outline" className="w-full" onClick={() => toast.info(t('settings.help_contact'))}>
          {t('settings.help')}
        </Button>
      </div>
    </div>
  );
}

