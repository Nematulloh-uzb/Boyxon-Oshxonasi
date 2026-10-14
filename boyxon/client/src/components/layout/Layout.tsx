import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { Footer } from './Footer';
import { MobileDrawer } from './MobileDrawer';
import { NotificationDrawer } from '../notification/NotificationDrawer';
import { PushPermissionPrompt } from '../notification/PushPermissionPrompt';
import { ChatWidget } from '../chat/ChatWidget';

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <Header />
      <MobileDrawer />
      <NotificationDrawer />
      <ChatWidget />
      {/* mobil pastki menyu balandligi: ~64px + safe-area; kontent yopishmasligi uchun */}
      <main className="flex-1 pb-28 md:pb-8">
        <Outlet />
      </main>
      <Footer />
      <BottomNav />
      <PushPermissionPrompt />
    </div>
  );
}
