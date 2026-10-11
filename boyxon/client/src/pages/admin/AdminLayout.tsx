import { Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { AdminTopBar } from '../../components/admin/AdminTopBar';

const titleKeys: Record<string, string> = {
  '/admin': 'admin.dashboard',
  '/admin/dishes': 'admin.dishes',
  '/admin/orders': 'admin.orders',
  '/admin/users': 'admin.users',
  '/admin/promos': 'admin.promos',
  '/admin/push': 'admin.push_title',
};

export default function AdminLayout() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  return (
    <div className="min-h-screen bg-muted md:flex">
      <AdminSidebar />
      <div className="flex-1">
        <AdminTopBar title={t(titleKeys[pathname] ?? 'admin.title')} />
        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
