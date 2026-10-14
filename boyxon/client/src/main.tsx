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
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <App />
        <Toaster position="top-center" richColors closeButton />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);
