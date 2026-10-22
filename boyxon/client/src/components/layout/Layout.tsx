import { Suspense, lazy, useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { KitchenClosedBanner } from './KitchenClosedBanner';
import { BottomNav } from './BottomNav';
import { Footer } from './Footer';
import { PushPermissionPrompt } from '../notification/PushPermissionPrompt';
import { useUiStore } from '../../store/ui.store';
import { useAuthStore } from '../../store/auth.store';

// Og'ir drawer/chat oynalari faqat kerak bo'lganda yuklanadi. Shu tufayli
// framer-motion va socket.io-client mehmonning birinchi yuklanishiga tushmaydi.
const MobileDrawer = lazy(() =>
  import('./MobileDrawer').then((m) => ({ default: m.MobileDrawer })),
);
const NotificationDrawer = lazy(() =>
  import('../notification/NotificationDrawer').then((m) => ({ default: m.NotificationDrawer })),
);
const ChatWidget = lazy(() =>
  import('../chat/ChatWidget').then((m) => ({ default: m.ChatWidget })),
);

export function Layout() {
  const { mobileDrawer, notifOpen } = useUiStore();
  const token = useAuthStore((s) => s.accessToken);
  const [mobileLoaded, setMobileLoaded] = useState(false);
  const [notifLoaded, setNotifLoaded] = useState(false);
  const [footerReady, setFooterReady] = useState(false);

  // Bir marta ochilgandan keyin komponent mounted qoladi — yopilish animatsiyasi
  // uchun (AnimatePresence exit). Birinchi ochilishgacha modul yuklanmaydi.
  useEffect(() => {
    if (mobileDrawer) setMobileLoaded(true);
  }, [mobileDrawer]);
  useEffect(() => {
    if (notifOpen) setNotifLoaded(true);
  }, [notifOpen]);
  // Footer birinchi paintdan keyin mount bo'ladi: uning kategoriya so'rovi
  // LCP bannerini kutmaydi va dastlabki render og'irlashmaydi.
  useEffect(() => {
    let second = 0;
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => setFooterReady(true));
    });
    return () => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <Header />
      <KitchenClosedBanner />
      {mobileLoaded && (
        <Suspense fallback={null}>
          <MobileDrawer />
        </Suspense>
      )}
      {notifLoaded && (
        <Suspense fallback={null}>
          <NotificationDrawer />
        </Suspense>
      )}
      {token && (
        <Suspense fallback={null}>
          <ChatWidget />
        </Suspense>
      )}
      {/* mobil pastki menyu balandligi: ~64px + safe-area; kontent yopishmasligi uchun */}
      <main className="flex-1 pb-28 md:pb-8">
        <Outlet />
      </main>
      {footerReady && <Footer />}
      <BottomNav />
      <PushPermissionPrompt />
    </div>
  );
}
