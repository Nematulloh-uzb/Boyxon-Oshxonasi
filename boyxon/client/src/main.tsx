import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import { BASENAME } from './lib/seo';
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
import './locales/i18n';

const qc = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      // Ma'lumotlar oqilona yangilanadi: katalog sekin eskiradi,
      // buyurtma/bildirishnoma socket + invalidate bilan, deraza fokuslanganda
      // ham yangilanadi (admin narxi darhol ko'rinadi).
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      refetchOnReconnect: true,
      staleTime: 60_000, // 1 daqiqa — keyin "eskirgan" hisoblanadi
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={qc}>
      <BrowserRouter
        basename={BASENAME}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
        <Toaster position="top-center" richColors closeButton />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);
