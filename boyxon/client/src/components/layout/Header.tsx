import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Bell, Menu, Moon, ShoppingBag, Sun, User } from 'lucide-react';
import { useCartStore } from '../../store/cart.store';
import { useAuthStore } from '../../store/auth.store';
import { useUiStore } from '../../store/ui.store';
import { useQuery } from '@tanstack/react-query';
import { notificationsApi } from '../../api/notifications.api';

type Theme = 'light' | 'dark';

function currentTheme(): Theme {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

export function Header() {
  const count = useCartStore((s) => s.lines.reduce((a, l) => a + l.quantity, 0));
  const { user, accessToken } = useAuthStore();
  const { set } = useUiStore();
  const nav = useNavigate();
  const { data } = useQuery({
    queryKey: ['unread-count'],
    queryFn: () => notificationsApi.unreadCount().then((r) => r.data.count),
    enabled: Boolean(accessToken),
    refetchInterval: 60_000,
  });

  // Tema toggle — guest uchun ham ishlaydi (localStorage'da saqlanadi)
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem('boyxon-theme') as Theme | null;
    return stored ?? user?.preferences.theme ?? currentTheme();
  });
  useEffect(() => {
    // Login bo'lgan user'da server preference ustuvor; aks holda localStorage
    const t = user?.preferences.theme ?? theme;
    document.documentElement.classList.toggle('dark', t === 'dark');
    localStorage.setItem('boyxon-theme', t);
    setTheme(t);
    // theme dependency'siz — aks holda toggle server preference'ga qaytadi
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const toggleTheme = (): void => {
    const next: Theme = currentTheme() === 'dark' ? 'light' : 'dark';
    localStorage.setItem('boyxon-theme', next);
    document.documentElement.classList.toggle('dark', next === 'dark');
    setTheme(next);
  };

  return (
    <header className="sticky top-0 z-30 border-b border-ink-line/60 bg-cream/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
        <button className="rounded-full p-2 hover:bg-black/5 dark:hover:bg-white/10 md:hidden" onClick={() => set({ mobileDrawer: true })} aria-label="Menyu">
          <Menu className="h-6 w-6" />
        </button>
        <Link to="/" className="font-display text-xl font-extrabold text-primary-600">
          Boyxon
        </Link>
        <nav className="ml-6 hidden items-center gap-5 text-[15px] font-medium md:flex">
          <Link to="/" className="hover:text-primary-600">Menyu</Link>
          <Link to="/cart" className="hover:text-primary-600">Savatcha</Link>
          {user?.role === 'admin' && <Link to="/admin" className="hover:text-primary-600">Admin</Link>}
        </nav>
        <div className="ml-auto flex items-center gap-1">
          {accessToken && (
            <button className="relative rounded-full p-2.5 hover:bg-black/5 dark:hover:bg-white/10" onClick={() => set({ notifOpen: true })} aria-label="Bildirishnomalar">
              <Bell className="h-5 w-5" />
              {(data ?? 0) > 0 && (
                <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
                  {data}
                </span>
              )}
            </button>
          )}
          <button className="relative rounded-full p-2.5 hover:bg-black/5 dark:hover:bg-white/10" onClick={() => nav('/cart')} aria-label="Savatcha">
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-primary-500 px-1 text-[10px] font-bold text-white">
                {count}
              </span>
            )}
          </button>
          <button
            className="rounded-full p-2.5 hover:bg-black/5 dark:hover:bg-white/10"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Yorug‘ rejim' : 'Qorong‘i rejim'}
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
          <button
            className="rounded-full p-2.5 hover:bg-black/5 dark:hover:bg-white/10"
            onClick={() => nav(accessToken ? '/settings' : '/auth')}
            aria-label="Hisob"
          >
            <User className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
