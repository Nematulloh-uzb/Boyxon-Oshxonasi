import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';

export function AdminRoute({ children }: { children: ReactNode }) {
  const { accessToken, user } = useAuthStore();
  if (!accessToken) return <Navigate to="/auth" replace />;
  if (user && user.role !== 'admin') {
    return (
      <div className="min-h-screen grid place-items-center p-6 text-center">
        <div>
          <h1 className="font-display text-2xl font-bold">403 — Ruxsat yo‘q</h1>
          <p className="mt-2 text-ink-300">Bu sahifa faqat adminlar uchun.</p>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}
