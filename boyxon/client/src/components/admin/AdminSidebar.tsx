import { NavLink, useNavigate } from 'react-router-dom';
import { ChefHat, Home, Gift, Megaphone, Package, ShoppingCart, Users } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import { cn } from '../../lib/utils';

const links = [
  { to: '/admin', icon: Home, label: 'Dashboard', end: true },
  { to: '/admin/orders', icon: ShoppingCart, label: 'Buyurtmalar' },
  { to: '/admin/dishes', icon: ChefHat, label: 'Taomlar' },
  { to: '/admin/categories', icon: Package, label: 'Kategoriyalar' },
  { to: '/admin/users', icon: Users, label: 'Foydalanuvchilar' },
  { to: '/admin/promos', icon: Gift, label: 'Promolar' },
  { to: '/admin/push', icon: Megaphone, label: 'Push' },
];

export function AdminSidebar() {
  const logout = useAuthStore((s) => s.logout);
  const nav = useNavigate();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col bg-ink-900 p-4 md:flex">
        <NavLink to="/" className="font-display text-lg font-extrabold text-primary-500">
          Boyxon Admin
        </NavLink>
        <nav className="mt-6 flex flex-col gap-1">
          {links.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium',
                  isActive ? 'bg-primary-500 text-white' : 'text-white/70 hover:bg-white/10',
                )
              }
            >
              <Icon className="h-5 w-5" />
              {label}
            </NavLink>
          ))}
        </nav>
        <button
          onClick={() => { logout(); nav('/'); }}
          className="mt-auto rounded-xl px-3 py-2.5 text-left text-sm font-medium text-white/60 hover:bg-white/10"
        >
          Chiqish
        </button>
      </aside>

      {/* Mobile nav */}
      <nav className="no-scrollbar sticky top-0 z-20 flex gap-1 overflow-x-auto bg-ink-900 p-2 md:hidden">
        {links.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium',
                isActive ? 'bg-primary-500 text-white' : 'text-white/70',
              )
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>
    </>
  );
}
