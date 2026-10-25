import { NavLink, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useCartStore } from '../../store/cart.store';
import { cn } from '../../lib/utils';

export function BottomNav() {
  const { t } = useTranslation();
  const location = useLocation();
  const count = useCartStore((s) => s.lines.reduce((a, l) => a + l.quantity, 0));
  const items = [
    { to: '/', icon: Home, label: t('nav.home') },
    { to: '/cart', icon: ShoppingBag, label: t('nav.cart'), badge: count },
    { to: '/settings', icon: Settings, label: t('nav.settings') },
  ];

  return (
    // Suzuvchi, ensizroq va ixcham "pill" navigatsiya paneli (safe-area hisobga olingan)
    <nav className="fixed inset-x-0 bottom-0 z-30 flex justify-center px-4 pb-[calc(0.6rem_+_env(safe-area-inset-bottom,0px))] md:hidden pointer-events-none">
      <div className="pointer-events-auto flex w-auto min-w-[260px] max-w-[280px] items-center justify-around gap-1 rounded-[26px] border border-ink-line/50 bg-surface/90 p-1.5 shadow-2xl backdrop-blur-xl dark:bg-surface/85 dark:border-ink-line/30">
        {items.map(({ to, icon: Icon, label, badge }) => {
          const isActive = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);
          return (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              aria-label={label}
              className={cn(
                'relative flex h-[50px] flex-1 flex-col items-center justify-center rounded-[20px] px-2 py-1 transition-all duration-300 active:scale-95',
                isActive
                  ? 'text-primary-600 dark:text-primary-400 font-bold'
                  : 'text-ink-300 hover:text-ink-500 font-medium',
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute inset-0 rounded-[20px] bg-primary-500/10 dark:bg-primary-500/20"
                  transition={{ type: 'spring', stiffness: 500, damping: 32, mass: 0.6 }}
                />
              )}
              <span className="relative z-10 flex flex-col items-center">
                <span className="relative">
                  <Icon
                    className={cn(
                      'h-[19px] w-[19px] transition-transform duration-300',
                      isActive ? 'scale-110 stroke-[2.3]' : 'stroke-[1.9]',
                    )}
                  />
                  {!!badge && badge > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -right-2.5 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-gradient-to-r from-primary-600 to-primary-700 px-1 text-[9px] font-extrabold text-white shadow-sm"
                    >
                      {badge > 99 ? '99+' : badge}
                    </motion.span>
                  )}
                </span>
                <span className="mt-1 text-[10px] tracking-tight leading-none">
                  {label}
                </span>
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}

