import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { KeyRound, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { authApi } from '../../api/auth.api';
import { resetValidator, type ResetForm } from '../../lib/validators';

/**
 * Parolni tiklash — 2-qadam: `/reset-password/:token` havolasidan kelib,
 * yangi parol o'rnatiladi. Token 15 daqiqa amal qiladi va bir martalik.
 */
export default function ResetPasswordPage() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const { token } = useParams<{ token?: string }>();
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState('');
  const form = useForm<ResetForm>({
    resolver: zodResolver(resetValidator),
    defaultValues: { password: '', confirm: '' },
  });

  if (!token) {
    return (
      <div className="grid min-h-screen place-items-center bg-bg p-6">
        <div className="w-full max-w-md rounded-card border border-ink-line bg-surface p-8 text-center shadow-sm">
          <XCircle className="mx-auto h-14 w-14 text-danger" />
          <h1 className="mt-4 font-display text-xl font-extrabold text-ink-900">
            {t('auth.reset_failed')}
          </h1>
          <Button className="mt-6 w-full" onClick={() => nav('/forgot-password', { replace: true })}>
            {t('auth.reset_back')}
          </Button>
        </div>
      </div>
    );
  }

  const onSubmit = form.handleSubmit(async (v) => {
    setServerError('');
    try {
      await authApi.resetPassword(token, v.password);
      setDone(true);
    } catch (e) {
      setServerError(
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          t('auth.reset_failed'),
      );
    }
  });

  return (
    <div className="grid min-h-screen place-items-center bg-bg p-6">
      <div className="w-full max-w-md rounded-card border border-ink-line bg-surface p-8 text-center shadow-sm">
        {done ? (
          <>
            <CheckCircle2 className="mx-auto h-14 w-14 text-success" />
            <h1 className="mt-4 font-display text-xl font-extrabold text-ink-900">
              {t('auth.reset_new_title')}
            </h1>
            <p className="mt-2 text-sm text-ink-300">{t('auth.reset_success')}</p>
            <Button className="mt-6 w-full" onClick={() => nav('/auth', { replace: true })}>
              {t('auth.reset_back')}
            </Button>
          </>
        ) : (
          <>
            <KeyRound className="mx-auto h-14 w-14 text-primary-500" />
            <h1 className="mt-4 font-display text-xl font-extrabold text-ink-900">
              {t('auth.reset_new_title')}
            </h1>
            <p className="mt-2 text-sm text-ink-300">{t('auth.reset_new_subtitle')}</p>
            <form onSubmit={onSubmit} className="mt-6 space-y-3 text-left">
              <Input
                type="password"
                placeholder={t('auth.reset_new_password')}
                autoComplete="new-password"
                {...form.register('password')}
              />
              <Input
                type="password"
                placeholder={t('auth.reset_confirm')}
                autoComplete="new-password"
                {...form.register('confirm')}
              />
              <p className="min-h-4 text-xs text-danger">
                {form.formState.errors.password?.message ??
                  form.formState.errors.confirm?.message ??
                  serverError}
              </p>
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  t('auth.reset_save')
                )}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
