import { NavLink } from 'react-router-dom';
import { Home, ShoppingBag, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCartStore } from '../../store/cart.store';
import { cn } from '../../lib/utils';

export function BottomNav() {
  const { t } = useTranslation();
  const count = useCartStore((s) => s.lines.reduce((a, l) => a + l.quantity, 0));
  const items = [
    { to: '/', icon: Home, label: t('nav.home') },
    { to: '/cart', icon: ShoppingBag, label: t('nav.cart'), badge: count },
    { to: '/settings', icon: Settings, label: t('nav.settings') },
  ];
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-ink-line bg-surface pb-[env(safe-area-inset-bottom)] md:hidden">
      <div className="grid grid-cols-3">
        {items.map(({ to, icon: Icon, label, badge }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn('relative flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium', isActive ? 'text-primary-600' : 'text-ink-300')
            }
          >
            <span className="relative">
              <Icon className="h-6 w-6" />
              {!!badge && badge > 0 && (
                <span className="absolute -right-2 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-primary-500 px-1 text-[9px] font-bold text-white">
                  {badge}
                </span>
              )}
            </span>
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
