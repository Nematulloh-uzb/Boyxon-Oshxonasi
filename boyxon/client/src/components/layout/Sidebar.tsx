import { NavLink } from 'react-router-dom';
import { Home, Settings, ShoppingBag, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import { cn } from '../../lib/utils';

const links = [
  { to: '/', icon: Home, label: 'Menyu' },
  { to: '/cart', icon: ShoppingBag, label: 'Savatcha' },
  { to: '/settings', icon: Settings, label: 'Sozlamalar' },
];

/** Desktop yon panel (lg+ ekranda). */
export function Sidebar() {
  const user = useAuthStore((s) => s.user);
  return (
    <aside className="hidden w-56 shrink-0 lg:block">
      <nav className="sticky top-20 flex flex-col gap-1 rounded-card border border-ink-line/60 bg-white p-2 shadow-sm">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium',
                isActive ? 'bg-primary-50 text-primary-700' : 'text-ink-700 hover:bg-black/5',
              )
            }
          >
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
        {user?.role === 'admin' && (
          <NavLink
            to="/admin"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-black/5"
          >
            <ShieldCheck className="h-5 w-5" />
            Admin
          </NavLink>
        )}
      </nav>
    </aside>
  );
}
