import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ServerWakeNotice } from './components/system/ServerWakeNotice';
import { installWakeRetry } from './api/wake-retry';
import { hydrateQueryCache, persistQueryCache } from './lib/query-cache';
import { langFromPath } from './lib/seo';
import { useTranslation } from 'react-i18next';
// Shriftlar self-hosted (Google Fonts CSS render-blocking so'rovi yo'q).
// To'liq subset CSS ishlatiladi: unda unicode-range bor, shuning uchun
// o'zbekcha sahifada faqat latin, ruscha sahifada esa kerakli cyrillic
// subset yuklanadi (subset-only CSS'da unicode-range yo'q edi).
import '@fontsource/epilogue/600.css';
import '@fontsource/epilogue/700.css';
import '@fontsource/epilogue/800.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import './styles/globals.css';
import i18n from './locales/i18n';

const qc = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      // Raketa tezligi: sahifalar orasida o'tganda qayta-qayta loading qilmaydi,
      // keshdan 0ms da bir zumda chiqaradi.
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: true,
      staleTime: 5 * 60 * 1000, // 5 daqiqa kesh faol turadi
      gcTime: 30 * 60 * 1000, // 30 daqiqa xotirada saqlanadi
    },
  },
});

// Render sovuq startiga tayyorgarlik:
// 1) oxirgi katalog localStorage'dan darhol tiklanadi (menyu kutmasdan ko'rinadi);
// 2) har bir so'rov muvaffaqiyatli bo'lsa, kesh yangilanadi;
// 3) uyg'onish paytidagi HTML/502 javoblari avtomatik qayta yuboriladi.
installWakeRetry();
hydrateQueryCache(qc);
persistQueryCache(qc);

/**
 * Router `basename`i joriy URL prefiksidan olinadi (`/ru`, `/en` yoki `/`).
 *
 * Til almashtirilganda `SettingsPage` avval URL'ni `replaceState` bilan
 * yangilaydi, keyin tilni o'zgartiradi. Shu paytda `basename` (va `key`)
 * o'zgaradi — router yangi prefiks bilan qayta quriladi, lekin sahifa
 * to'liq reload bo'lmaydi (JS qayta yuklanmaydi, kesh saqlanadi).
 */
function Root() {
  // Til o'zgarishiga obuna: `basename` qayta hisoblanishi uchun re-render.
  useTranslation();

  const urlLang = langFromPath();
  const basename = urlLang ? `/${urlLang}` : '/';

  return (
    <>
      <BrowserRouter
        key={basename}
        basename={basename}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </BrowserRouter>
      <ServerWakeNotice />
      <Toaster position="top-center" richColors closeButton />
    </>
  );
}

async function bootstrap(): Promise<void> {
  // "/" uchun o'zbek tili allaqachon bundle'da; /ru va /en uchun kerakli
  // tarjima chunki bir marta yuklanadi, keyin React render boshlanadi.
  try {
    await i18n.init();
  } catch {
    // Tarjima chunk'i yuklanmasa ham ilova o'zbek fallback bilan ochiladi.
  }

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <QueryClientProvider client={qc}>
        <Root />
      </QueryClientProvider>
    </React.StrictMode>,
  );
}

void bootstrap();
