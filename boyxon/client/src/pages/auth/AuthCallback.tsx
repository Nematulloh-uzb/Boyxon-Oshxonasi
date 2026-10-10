import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { authApi } from '../../api/auth.api';
import { useAuthStore } from '../../store/auth.store';

/** Google OAuth dan qaytgandan keyin: token → store → / */
export default function AuthCallback() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const { setToken, setUser } = useAuthStore();
  const qc = useQueryClient();

  useEffect(() => {
    const token = params.get('token');
    if (!token) {
      nav('/auth', { replace: true });
      return;
    }
    setToken(token);
    authApi
      .me()
      .then((r) => {
        setUser(r.data);
        void qc.invalidateQueries({ queryKey: ['me'] });
        const next = params.get('next');
        nav(next ?? (r.data.role === 'admin' ? '/admin' : '/'), { replace: true });
      })
      .catch(() => nav('/auth', { replace: true }));
    window.history.replaceState({}, '', window.location.pathname);
  }, [params, setToken, setUser, nav, qc]);

  return <div className="min-h-screen grid place-items-center text-ink-300">Kirilmoqda...</div>;
}
