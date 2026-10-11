import { NavLink } from 'react-router-dom';
import { Home, Settings, ShoppingBag, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/auth.store';
import { cn } from '../../lib/utils';

const links = [
  { to: '/', icon: Home, key: 'nav.menu' },
  { to: '/cart', icon: ShoppingBag, key: 'nav.cart' },
  { to: '/settings', icon: Settings, key: 'nav.settings' },
];

/** Desktop yon panel (lg+ ekranda). */
export function Sidebar() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  return (
    <aside className="hidden w-56 shrink-0 lg:block">
      <nav className="sticky top-20 flex flex-col gap-1 rounded-card border border-ink-line/60 bg-surface p-2 shadow-sm">
        {links.map(({ to, icon: Icon, key }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium',
                isActive ? 'bg-primary-50 text-primary-700' : 'text-ink-700 hover:bg-surface-raised',
              )
            }
          >
            <Icon className="h-5 w-5" />
            {t(key)}
          </NavLink>
        ))}
        {user?.role === 'admin' && (
          <NavLink
            to="/admin"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-surface-raised"
          >
            <ShieldCheck className="h-5 w-5" />
            {t('nav.admin')}
          </NavLink>
        )}
      </nav>
    </aside>
  );
}
