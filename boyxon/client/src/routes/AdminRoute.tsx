import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/auth.store';

export function AdminRoute({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const { accessToken, user } = useAuthStore();
  if (!accessToken) return <Navigate to="/auth" replace />;
  // Token bor-u user hali yuklanmagan (refresh/initial load) — kutamiz.
  // Aks holda admin bo'lmagan odam bir zumga admin layout'ni ko'radi (flicker).
  if (!user) {
    return (
      <div className="min-h-screen grid place-items-center text-ink-300">
        {t('common.loading')}
      </div>
    );
  }
  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen grid place-items-center p-6 text-center">
        <div>
          <h1 className="font-display text-2xl font-bold">{t('pages.403.title')} — 403</h1>
          <p className="mt-2 text-ink-300">{t('pages.403.desc')}</p>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}
