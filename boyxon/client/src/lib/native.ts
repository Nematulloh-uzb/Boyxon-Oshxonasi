/**
 * Boyxon Oshxonasi — Capacitor native ko'prigi.
 *
 * Sayt kodi o'ZGARMAYDI — bu modul faqat APK ichida (native) qo'shimcha
 * imkoniyatlarni yoqadi, brauzerda hech narsa qilmaydi:
 *
 * - StatusBar: dark/light mavzuga mos rang + overlay o'chirilgan
 * - Keyboard: input focus'da viewport resize (body)
 * - SplashScreen: birinchi render'dan keyin yashirish
 * - App: back tugma — router history bo'lsa orqaga, aks holda chiqmadi
 *   (Android back button 1:1 web harakati).
 * - Deep-link: boyxon://... havolalar router'ga uzatiladi (Google OAuth qaytishi).
 * - Google OAuth: native'da tizim brauzeri (Custom Tab) ochiladi, qaytish
 *   deep-link orqali — WebView ichida Google login bloklanmaydi.
 *
 * Web'da `Capacitor.isNativePlatform()` false → barcha funksiyalar no-op.
 */
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { Keyboard } from '@capacitor/keyboard';
import { SplashScreen } from '@capacitor/splash-screen';
import { StatusBar, Style } from '@capacitor/status-bar';

export const isNative = Capacitor.isNativePlatform();

function currentTheme(): 'light' | 'dark' {
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

async function syncStatusBar(): Promise<void> {
  if (!isNative) return;
  try {
    const theme = currentTheme();
    await StatusBar.setOverlaysWebView({ overlay: false });
    if (theme === 'dark') {
      await StatusBar.setStyle({ style: Style.Dark });
      await StatusBar.setBackgroundColor({ color: '#121212' });
    } else {
      await StatusBar.setStyle({ style: Style.Light });
      await StatusBar.setBackgroundColor({ color: '#FFF8F0' });
    }
  } catch {
    /* native bo'lmagan muhit — e'tiborsiz */
  }
}

/**
 * Google OAuth havolasini native'da tizim brauzerida ochish.
 * WebView ichida Google "403 disallowed_useragent" beradi — shuning uchun
 * Custom Tab (tizim brauzeri) ishlatiladi. Qaytish deep-link orqali:
 * server `boyxon://auth/callback?code=...` ga redirect qiladi.
 *
 * @returns true — native'da ochildi (default <a> ni to'xtatish kerak)
 */
export async function openGoogleAuth(googleUrl: string): Promise<boolean> {
  if (!isNative) return false;
  try {
    // `native=1` — server qaytishni deep-link (boyxon://...) qiladi.
    const url = new URL(googleUrl, window.location.href);
    url.searchParams.set('native', '1');
    await Browser.open({ url: url.toString() });
    return true;
  } catch {
    return false;
  }
}

/** Deep-link (`boyxon://...`) ni router path'ga aylantiradi: `/auth/callback?code=...` */
function deepLinkToPath(url: string): string | null {
  try {
    const u = new URL(url);
    // boyxon://auth/callback?code=... → /auth/callback?code=...
    const path = `/${u.host}${u.pathname}`.replace(/\/+/g, '/');
    return `${path}${u.search}${u.hash}`;
  } catch {
    return null;
  }
}

/**
 * App ishga tushganda BIR marta chaqiriladi (main.tsx dan).
 * `onDeepLink` — router navigate uchun callback (`/auth/callback?code=...`).
 * `onBack` — React Router orqaga yurishi uchun callback (BrowserRouter history).
 */
export function initNativeBridge(onDeepLink?: (path: string) => void, onBack?: () => boolean): void {
  if (!isNative) return;

  // Klaviatura ochilganda WebView resize — inputlar klaviatura tagida qolmaydi.
  void Keyboard.setResizeMode({ mode: 'body' }).catch(() => undefined);
  Keyboard.setAccessoryBarVisible({ visible: true }).catch(() => undefined);

  // Mavzu o'zgarganda status bar rangini sinxronlash.
  void syncStatusBar();
  const observer = new MutationObserver(() => void syncStatusBar());
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  });

  // Android back tugma: history bo'lsa router orqaga, aks holda ilovadan chiqish.
  void App.removeAllListeners().then(() => {
    void App.addListener('backButton', ({ canGoBack }) => {
      if (onBack?.()) return;
      if (canGoBack) {
        window.history.back();
      } else {
        void App.minimizeApp();
      }
    });

    // Deep-link: Google OAuth qaytishi (boyxon://auth/callback?code=...)
    // → tizim brauzerini yopib, router'ga uzatamiz.
    void App.addListener('appUrlOpen', (event) => {
      void Browser.close().catch(() => undefined);
      const path = deepLinkToPath(event.url);
      if (path) {
        if (onDeepLink) onDeepLink(path);
        else window.location.assign(path);
      }
    });
  });

  // Splash: birinchi content chizilgach yashirish.
  requestAnimationFrame(() => {
    setTimeout(() => {
      void SplashScreen.hide().catch(() => undefined);
    }, 300);
  });
}
