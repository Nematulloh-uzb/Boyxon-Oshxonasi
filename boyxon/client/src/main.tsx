import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'sonner';
import App from './App';
import './styles/globals.css';
import './locales/i18n';

const qc = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      // Hech qanday AVTOMATIK qayta yuklash yo'q — ma'lumotlar "muzlatilgan".
      // Faqat qo'lda (invalidateQueries/refetch) yoki real-time socket hodisasi
      // bilan yangilanadi. Foydalanuvchi ma'lumoti (auth store) o'zidan o'zgarmaydi.
      refetchOnWindowFocus: false,
      refetchOnMount: false, // sahifa/komponent qayta mount bo'lganda
      refetchOnReconnect: false, // internet qayta ulanganda
      staleTime: Infinity, // hech qachon "eskirigan" deb hisoblanmaydi
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={qc}>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <App />
        <Toaster position="top-center" richColors closeButton />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);
