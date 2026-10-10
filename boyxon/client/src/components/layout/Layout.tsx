import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { Footer } from './Footer';
import { MobileDrawer } from './MobileDrawer';
import { NotificationDrawer } from '../notification/NotificationDrawer';
import { PushPermissionPrompt } from '../notification/PushPermissionPrompt';

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <MobileDrawer />
      <NotificationDrawer />
      <main className="flex-1 pb-20 md:pb-0">
        <Outlet />
      </main>
      <Footer />
      <BottomNav />
      <PushPermissionPrompt />
    </div>
  );
}
