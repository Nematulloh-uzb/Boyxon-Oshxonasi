import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Home, ShoppingBag, Settings, MessageCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useCartStore } from '../../store/cart.store';
import { useAuthStore } from '../../store/auth.store';
import { useUiStore } from '../../store/ui.store';
import { cn } from '../../lib/utils';

export function BottomNav() {
  const { t } = useTranslation();
  const location = useLocation();
  const nav = useNavigate();
  const token = useAuthStore((s) => s.accessToken);
  const { chatOpen, set } = useUiStore();
  const count = useCartStore((s) => s.lines.reduce((a, l) => a + l.quantity, 0));

  const handleChatClick = () => {
    if (!token) {
      nav('/auth');
      toast.info(t('chat.login_required') || 'Chatdan foydalanish uchun profilingizga kiring');
      return;
    }
    set({ chatOpen: !chatOpen });
  };

  const navItems = [
    { type: 'link' as const, to: '/', icon: Home, label: t('nav.home') },
    { type: 'link' as const, to: '/cart', icon: ShoppingBag, label: t('nav.cart'), badge: count },
    {
      type: 'button' as const,
      icon: MessageCircle,
      label: t('nav.chat') || 'Chat',
      isActive: chatOpen,
      onClick: handleChatClick,
    },
    { type: 'link' as const, to: '/settings', icon: Settings, label: t('nav.settings') },
  ];

  return (
    // Suzuvchi, ensizroq va ixcham 4-talik "pill" navigatsiya paneli (safe-area hisobga olingan)
    <nav className="fixed inset-x-0 bottom-0 z-30 flex justify-center px-3 pb-[calc(0.6rem_+_env(safe-area-inset-bottom,0px))] md:hidden pointer-events-none">
      <div className="pointer-events-auto flex w-auto min-w-[310px] max-w-[340px] items-center justify-around gap-1 rounded-[26px] border border-ink-line/50 bg-surface/90 p-1.5 shadow-2xl backdrop-blur-xl dark:bg-surface/85 dark:border-ink-line/30">
        {navItems.map((item) => {
          const isItemActive =
            item.type === 'button'
              ? item.isActive
              : !chatOpen &&
                (item.to === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.to));

          const content = (
            <>
              {isItemActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute inset-0 rounded-[20px] bg-primary-500/10 dark:bg-primary-500/20"
                  transition={{ type: 'spring', stiffness: 500, damping: 32, mass: 0.6 }}
                />
              )}
              <span className="relative z-10 flex flex-col items-center">
                <span className="relative">
                  <item.icon
                    className={cn(
                      'h-[19px] w-[19px] transition-transform duration-200',
                      isItemActive ? 'scale-110 stroke-[2.3]' : 'stroke-[1.9]',
                    )}
                  />
                  {'badge' in item && !!item.badge && item.badge > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -right-2.5 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-gradient-to-r from-primary-600 to-primary-700 px-1 text-[9px] font-extrabold text-white shadow-sm"
                    >
                      {item.badge > 99 ? '99+' : item.badge}
                    </motion.span>
                  )}
                </span>
                <span className="mt-1 text-[10px] tracking-tight leading-none">
                  {item.label}
                </span>
              </span>
            </>
          );

          const className = cn(
            'relative flex h-[50px] flex-1 flex-col items-center justify-center rounded-[20px] px-1 py-1 transition-all duration-200 active:scale-95',
            isItemActive
              ? 'text-primary-600 dark:text-primary-400 font-bold'
              : 'text-ink-300 hover:text-ink-500 font-medium',
          );

          if (item.type === 'button') {
            return (
              <button
                key="nav-chat"
                type="button"
                onClick={item.onClick}
                aria-label={item.label}
                className={className}
              >
                {content}
              </button>
            );
          }

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              aria-label={item.label}
              onClick={() => {
                if (chatOpen) set({ chatOpen: false });
              }}
              className={className}
            >
              {content}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}


