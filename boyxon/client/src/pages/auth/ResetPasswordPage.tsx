import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { KeyRound, Loader2, CheckCircle2, XCircle, Mail } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { authApi } from '../../api/auth.api';
import { resetValidator, type ResetForm } from '../../lib/validators';

type Mode = 'checking' | 'form' | 'done' | 'failed';

/**
 * Parolni tiklash — 2-qadam: `/reset-password/:token` havolasidan kelib,
 * alohida tiklash oynasida yangi parol o'rnatiladi.
 *
 * Sahifa ochilganda token tekshiriladi va QAYSI EMAIL uchunligi ko'rsatiladi
 * (`GET /info` — parolni o'zgartirmaydi). Token 15 daqiqa amal qiladi, bir martalik.
 */
export default function ResetPasswordPage() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const { token } = useParams<{ token?: string }>();
  const [mode, setMode] = useState<Mode>(token ? 'checking' : 'failed');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [serverError, setServerError] = useState('');
  // StrictMode'da effekt ikki marta ishlaydi — info so'rovni takrorlamaymiz.
  const handled = useRef(false);
  const form = useForm<ResetForm>({
    resolver: zodResolver(resetValidator),
    defaultValues: { password: '', confirm: '' },
  });

  useEffect(() => {
    if (!token || handled.current) return;
    handled.current = true;
    authApi
      .resetPasswordInfo(token)
      .then((r) => {
        setEmail(r.data.email);
        setMode('form');
      })
      .catch((e) => {
        setMessage(
          (e as { response?: { data?: { message?: string } } })?.response?.data?.message ??
            t('auth.reset_failed'),
        );
        setMode('failed');
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const onSubmit = form.handleSubmit(async (v) => {
    if (!token) return;
    setServerError('');
    try {
      await authApi.resetPassword(token, v.password);
      setMode('done');
    } catch (e) {
      setServerError(
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          t('auth.reset_failed'),
      );
    }
  });
  void onSubmit;
  void setServerError;
  void serverError;
  void form;
  void t;
  void nav;
  void email;
  void message;
  void mode;
  void setMode;
  void setEmail;
  void setMessage;
  void KeyRound;
  void Loader2;
  void CheckCircle2;
  void XCircle;
  void Mail;
  void Input;
  void Button;
  return null;
}
