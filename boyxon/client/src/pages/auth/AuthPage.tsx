import { useEffect, useState } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { authApi } from '../../api/auth.api';
import { useAuthStore } from '../../store/auth.store';
import { loginValidator, registerValidator, type LoginForm, type RegisterForm } from '../../lib/validators';
import type { User } from '../../types';

export default function AuthPage() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const loc = useLocation();
  const [searchParams] = useSearchParams();
  const { accessToken, setToken, setUser, user } = useAuthStore();

  const from = (loc.state as { from?: string } | null)?.from ?? '/';

  // Google OAuth xatosi (masalan bekor qilingan yoki sozlanmagan) — toast bilan ko'rsatamiz.
  useEffect(() => {
    const err = searchParams.get('error');
    if (err === 'google') toast.error(t('auth.google_cancelled'));
    else if (err === 'google_not_configured') toast.error(t('auth.google_not_configured'));
    // Admin hisob Google orqali kira olmaydi — faqat email + parol.
    else if (err === 'admin_password_only') toast.error(t('auth.admin_password_only'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    // Faqat user YUKLANGANDAN keyin redirect — accessToken bor-u user hali null
    // bo'lgan oraliqda (refresh/initial load) / ga sakrab ketmasligi uchun.
    if (accessToken && user) nav(user.role === 'admin' ? '/admin' : from, { replace: true });
  }, [accessToken, user, nav, from]);

  return (
    <div className="min-h-screen md:grid md:grid-cols-2">
      <div className="relative flex flex-col justify-between bg-gradient-to-br from-primary-500 to-primary-700 p-8 text-white md:p-12">
        <p className="font-display text-2xl font-extrabold">Boyxon Oshxonasi</p>
        <div className="hidden md:block">
          <h1 className="font-display text-4xl font-extrabold leading-tight">
            {t('auth.hero_line1')}<br />{t('auth.hero_line2')}
          </h1>
          <p className="mt-3 max-w-sm text-white/80">{t('auth.hero_subtitle')}</p>
        </div>
        <p className="text-sm text-white/70">© {new Date().getFullYear()} Boyxon</p>
      </div>
      <div className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-sm">
          <AuthForm from={from} onDone={(token, u) => { setToken(token); setUser(u); nav(u.role === 'admin' ? '/admin' : from, { replace: true }); }} />
        </div>
      </div>
    </div>
  );
}

function AuthForm({ from, onDone }: { from: string; onDone: (token: string, u: User) => void }) {
  const { t } = useTranslation();
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const googleUrl = authApi.googleUrl();
  const nav = useNavigate();

  const loginForm = useForm<LoginForm>({ resolver: zodResolver(loginValidator), defaultValues: { email: '', password: '' } });
  const regForm = useForm<RegisterForm>({ resolver: zodResolver(registerValidator), defaultValues: { name: '', email: '', password: '' } });

  const onLogin = loginForm.handleSubmit(async (v) => {
    try {
      const r = await authApi.login(v);
      onDone(r.data.accessToken, r.data.user);
      toast.success(t('auth.welcome_back'));
    } catch (e) {
      const res = (e as { response?: { data?: { message?: string; code?: string; data?: { email?: string } } } })?.response?.data;
      // Email tasdiqlanmagan — foydalanuvchini tasdiqlash sahifasiga yuboramiz.
      if (res?.code === 'EMAIL_NOT_VERIFIED') {
        toast.error(res.message ?? t('auth.verify_not_verified'));
        nav(`/verify-email?email=${encodeURIComponent(res.data?.email ?? v.email)}`, { replace: true });
        return;
      }
      toast.error(res?.message ?? t('auth.login_error'));
    }
  });

  const onRegister = regForm.handleSubmit(async (v) => {
    try {
      const r = await authApi.register(v);
      toast.success(r.message);
      // Email tasdiqlash majburiy bo'lsa token berilmaydi — tasdiqlash sahifasiga o'tamiz.
      if (r.data.verificationRequired || !r.data.accessToken) {
        nav(`/verify-email?email=${encodeURIComponent(r.data.user.email)}`, { replace: true });
        return;
      }
      onDone(r.data.accessToken, r.data.user);
    } catch (e) {
      toast.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? t('common.error'));
    }
  });

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <div className="mb-6 grid grid-cols-2 gap-1 rounded-2xl bg-muted p-1">
        {(['signin', 'signup'] as const).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`rounded-xl py-2.5 text-sm font-semibold transition ${tab === key ? 'bg-surface text-primary-700 shadow-sm' : 'text-ink-300'}`}
          >
            {key === 'signin' ? t('auth.signin') : t('auth.signup')}
          </button>
        ))}
      </div>

      {tab === 'signin' ? (
        <form onSubmit={onLogin} className="space-y-3">
          <Input type="email" placeholder={t('auth.email')} {...loginForm.register('email')} />
          <Input type="password" placeholder={t('auth.password')} {...loginForm.register('password')} />
          <p className="min-h-4 text-xs text-danger">
            {loginForm.formState.errors.email?.message ?? loginForm.formState.errors.password?.message}
          </p>
          <Button type="submit" className="w-full" disabled={loginForm.formState.isSubmitting}>
            {loginForm.formState.isSubmitting ? '...' : t('auth.signin')}
          </Button>
          <button
            type="button"
            onClick={() => nav('/forgot-password')}
            className="w-full pt-1 text-center text-xs font-medium text-primary-600 hover:underline"
          >
            {t('auth.forgot')}
          </button>
        </form>
      ) : (
        <form onSubmit={onRegister} className="space-y-3">
          <Input placeholder={t('auth.name')} {...regForm.register('name')} />
          <Input type="email" placeholder={t('auth.email')} {...regForm.register('email')} />
          <Input type="password" placeholder={t('auth.password_hint')} {...regForm.register('password')} />
          <p className="min-h-4 text-xs text-danger">
            {regForm.formState.errors.name?.message ?? regForm.formState.errors.email?.message ?? regForm.formState.errors.password?.message}
          </p>
          <Button type="submit" className="w-full" disabled={regForm.formState.isSubmitting}>
            {regForm.formState.isSubmitting ? '...' : t('auth.signup')}
          </Button>
        </form>
      )}

      <div className="my-4 flex items-center gap-3 text-xs text-ink-300">
        <span className="h-px flex-1 bg-ink-line" /> {t('auth.or')} <span className="h-px flex-1 bg-ink-line" />
      </div>
      <a href={googleUrl} className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-ink-line bg-surface text-[15px] font-medium">
        <svg className="h-5 w-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A11 11 0 0 0 2.18 7.06L5.84 9.9c.87-2.6 3.3-4.52 6.16-4.52z"/></svg>
        {t('auth.google')}
      </a>
      <p className="mt-4 text-center text-xs text-ink-300">{t('auth.demo')}: aziz@example.com / User123!</p>
    </motion.div>
  );
}
