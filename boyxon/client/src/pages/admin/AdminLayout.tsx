import { Outlet, useLocation } from 'react-router-dom';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { AdminTopBar } from '../../components/admin/AdminTopBar';

const titles: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/dishes': 'Taomlar',
  '/admin/orders': 'Buyurtmalar',
  '/admin/users': 'Foydalanuvchilar',
  '/admin/promos': 'Promolar',
  '/admin/push': 'Push yuborish',
};

export default function AdminLayout() {
  const { pathname } = useLocation();
  return (
    <div className="min-h-screen bg-[#F7F4EF] md:flex">
      <AdminSidebar />
      <div className="flex-1">
        <AdminTopBar title={titles[pathname] ?? 'Admin'} />
        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
