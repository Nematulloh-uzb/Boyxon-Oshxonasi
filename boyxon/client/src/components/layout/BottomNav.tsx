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
    // Suzuvchi "pill" navigatsiya: pastdan 8px (safe-area hisobga olingan)
    // ko'tarilgan, kontent ustida turadi. Cart sahifasidagi checkout paneli
    // 4rem'da — bu bar undan pastroqda (~3.9rem) qoladi, ustma-ust tushmaydi.
    <nav className="fixed inset-x-0 bottom-0 z-30 flex justify-center px-4 pb-[calc(0.5rem_+_env(safe-area-inset-bottom,0px))] md:hidden">
      <div className="flex w-full max-w-md items-center gap-0.5 rounded-full border border-ink-line/60 bg-surface/95 p-1 shadow-overlay backdrop-blur">
        {items.map(({ to, icon: Icon, label, badge }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            aria-label={label}
            className={({ isActive }) =>
              cn(
                'relative flex h-11 flex-1 items-center justify-center rounded-full transition-colors',
                isActive
                  ? 'bg-primary-50 text-primary-600 shadow-sm dark:bg-bg dark:text-primary-500'
                  : 'text-ink-300 hover:text-ink-500',
              )
            }
          >
            <span className="relative">
              <Icon className="h-[22px] w-[22px]" strokeWidth={2.1} />
              {!!badge && badge > 0 && (
                <span className="absolute -right-2 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-primary-700 px-1 text-[9px] font-bold text-white">
                  {badge}
                </span>
              )}
            </span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
