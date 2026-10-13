import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { CheckCircle2, MailCheck, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { Button } from '../../components/ui/Button';
import { authApi } from '../../api/auth.api';
import { useAuthStore } from '../../store/auth.store';
import { tVal } from '../../lib/format';

type Mode = 'waiting' | 'checking' | 'success' | 'failed';

/**
 * Email tasdiqlash sahifasi. Ikki vazifasi bor:
 *
 * 1. `/verify-email` — "pochtangizni tekshiring" xabari + qayta yuborish tugmasi.
 * 2. `/verify-email/:token` — havoladan kelgan tokenni serverga yuborib tasdiqlash.
 *
 * Bu — email haqiqiyligini aniqlashning YAGONA ishonchli yo'li: format va MX
 * tekshiruvlari faqat domenni tasdiqlaydi, hisob egasini emas.
 */
export default function VerifyEmailPage() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const { token } = useParams<{ token?: string }>();
  const [params] = useSearchParams();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const logoutServer = useAuthStore((s) => s.logoutServer);

  const [mode, setMode] = useState<Mode>(token ? 'checking' : 'waiting');
  const [message, setMessage] = useState('');
  const [resending, setResending] = useState(false);
  // StrictMode'da effekt ikki marta ishlaydi — token bir martalik, takror yubormaymiz.
  const handled = useRef(false);

  useEffect(() => {
    if (!token || handled.current) return;
    handled.current = true;
    authApi
      .verifyEmail(token)
      .then((r) => {
        setMode('success');
        setMessage(r.message);
        // Store'dagi userni yangilaymiz — banner darhol yo'qoladi.
        if (user) setUser({ ...user, emailVerified: true });
      })
      .catch((e) => {
        setMode('failed');
        setMessage(
          (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? t('auth.verify_failed'),
        );
      });
  }, [token, user, setUser, t]);

  const resend = async (): Promise<void> => {
    const email = user?.email ?? params.get('email');
    if (!email) {
      nav('/auth', { replace: true });
      return;
    }
    setResending(true);
    try {
      await authApi.resendVerification(email);
      toast.success(t('auth.verify_resent'));
    } catch (e) {
      toast.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? t('common.error'));
    } finally {
      setResending(false);
    }
  };

  const email = user?.email ?? params.get('email') ?? '';

  return (
    <div className="grid min-h-screen place-items-center bg-bg p-6">
      <div className="w-full max-w-md rounded-card border border-ink-line bg-surface p-8 text-center shadow-sm">
        {mode === 'checking' && (
          <>
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary-500" />
            <p className="mt-4 text-sm text-ink-300">{t('auth.verify_checking')}</p>
          </>
        )}

        {mode === 'success' && (
          <>
            <CheckCircle2 className="mx-auto h-14 w-14 text-success" />
            <h1 className="mt-4 font-display text-xl font-extrabold text-ink-900">{t('auth.verify_success')}</h1>
            <p className="mt-2 text-sm text-ink-300">{message}</p>
            <Button className="mt-6 w-full" onClick={() => nav(user?.role === 'admin' ? '/admin' : '/', { replace: true })}>
              {t('common.next')}
            </Button>
          </>
        )}

        {mode === 'failed' && (
          <>
            <XCircle className="mx-auto h-14 w-14 text-danger" />
            <h1 className="mt-4 font-display text-xl font-extrabold text-ink-900">{t('auth.verify_failed')}</h1>
            <p className="mt-2 text-sm text-ink-300">{message}</p>
            <Button className="mt-6 w-full" onClick={() => void resend()} disabled={resending}>
              {resending ? '...' : t('auth.verify_resend')}
            </Button>
            <button
              type="button"
              onClick={() => nav('/auth', { replace: true })}
              className="mt-3 text-xs font-medium text-ink-300 underline"
            >
              {t('auth.verify_go_login')}
            </button>
          </>
        )}

        {mode === 'waiting' && (
          <>
            <MailCheck className="mx-auto h-14 w-14 text-primary-500" />
            <h1 className="mt-4 font-display text-xl font-extrabold text-ink-900">{t('auth.verify_title')}</h1>
            {email && <p className="mt-2 text-sm text-ink-700">{tVal(t('auth.verify_sent_to'), { email })}</p>}
            <p className="mt-2 text-xs text-ink-300">{t('auth.verify_spam_hint')}</p>
            <Button className="mt-6 w-full" onClick={() => void resend()} disabled={resending}>
              {resending ? '...' : t('auth.verify_resend')}
            </Button>
            <button
              type="button"
              onClick={() => {
                void logoutServer();
                nav('/auth', { replace: true });
              }}
              className="mt-4 text-xs font-medium text-ink-300 underline"
            >
              {t('auth.verify_logout')}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
