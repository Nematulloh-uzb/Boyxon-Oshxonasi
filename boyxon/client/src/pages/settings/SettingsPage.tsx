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
import { formatDate, formatPrice, ORDER_STATUS_LABEL } from '../../lib/format';

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
    toast.success('Til yangilandi');
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

      <SettingsGroup title="Hisob">
        <SettingsRow icon={MapPin} label="Manzillar" value={`${user.addresses.length} ta`} onClick={() => toast.info('Manzil boshqaruvi tez orada')} />
        <SettingsRow icon={Package} label="Buyurtmalarim" value={orders ? `${orders.pagination.total} ta` : '...'} onClick={() => toast.info('So‘nggi buyurtmalar quyida keltirilgan')} />
        <SettingsRow icon={Bell} label="Bildirishnomalar" onClick={() => toast.info('Qo‘ng‘iroq ikonkasini bosing')} />
      </SettingsGroup>

      <SettingsGroup title="Afzalliklar">
        <SettingsRow
          icon={Globe}
          label="Til"
          right={
            <div className="flex gap-1">
              {LANGS.map((l) => (
                <button
                  key={l.v}
                  onClick={() => void setLang(l.v)}
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${i18n.language === l.v ? 'bg-primary-500 text-white' : 'bg-black/5 dark:bg-white/10 text-ink-700'}`}
                >
                  {l.v.toUpperCase()}
                </button>
              ))}
            </div>
          }
        />
        <SettingsRow
          icon={user.preferences.theme === 'dark' ? Moon : Sun}
          label="Tema"
          value={user.preferences.theme === 'dark' ? 'Qorong‘i' : 'Yorug‘'}
          right={
            <button onClick={() => void toggleTheme()} className="text-primary-600 text-sm font-semibold">
              Almashtirish
            </button>
          }
        />
      </SettingsGroup>

      <NotificationPrefs prefs={user.notificationPrefs} />

      <SettingsGroup title="Xavfsizlik">
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
        <h2 className="mb-2 px-1 text-sm font-semibold uppercase tracking-wide text-ink-300">So‘nggi buyurtmalar</h2>
        <div className="space-y-2">
          {!orders?.data.length && <Card className="p-4 text-sm text-ink-300">Hozircha buyurtmalar yo‘q</Card>}
          {orders?.data.map((o) => (
            <Card key={o._id} className="flex items-center justify-between p-4">
              <div>
                <p className="font-semibold">{o.orderNumber}</p>
                <p className="text-xs text-ink-300">{formatDate(o.createdAt)} · {o.items.length} ta taom</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-primary-600">{formatPrice(o.total)}</p>
                <p className="text-xs text-ink-300">{ORDER_STATUS_LABEL[o.status]}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <div className="pb-4">
        <Button variant="outline" className="w-full" onClick={() => toast.info('Yordam: +998 71 200 00 00')}>
          Yordam
        </Button>
      </div>
    </div>
  );
}

