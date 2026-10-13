import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { authApi } from '../../api/auth.api';
import { useAuthStore } from '../../store/auth.store';

/**
 * Google OAuth dan qaytgandan keyin: bir martalik kod → token → store → /.
 *
 * Xavfsizlik: URL'da endi access token emas, `code` keladi. Kod bir marta ishlaydi va
 * 60 soniyada eskiradi. Sabab: URL manzil brauzer tarixiga, proksi/server loglariga va
 * `Referer` sarlavhasi orqali uchinchi tomon saytlariga tushib qolishi mumkin.
 */
export default function AuthCallback() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const { setToken, setUser } = useAuthStore();
  const qc = useQueryClient();
  // React 18 StrictMode'da effekt ikki marta ishlaydi — kod bir martalik bo'lgani uchun
  // ikkinchi urinish muvaffaqiyatsiz bo'lardi. Shuning uchun qayta ishlashni to'xtatamiz.
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const code = params.get('code');
    if (!code) {
      nav('/auth', { replace: true });
      return;
    }
    // Kodni darhol URL'dan olib tashlaymiz — tarixga/logga tushmasin.
    window.history.replaceState({}, '', window.location.pathname);

    authApi
      .googleExchange(code)
      .then((res) => {
        setToken(res.data.accessToken);
        setUser(res.data.user);
        void qc.invalidateQueries({ queryKey: ['me'] });
        const next = params.get('next');
        nav(next ?? (res.data.user.role === 'admin' ? '/admin' : '/'), { replace: true });
      })
      .catch(() => nav('/auth', { replace: true }));
  }, [params, setToken, setUser, nav, qc]);

  return <div className="min-h-screen grid place-items-center text-ink-300">{t('auth.signing_in')}</div>;
}
