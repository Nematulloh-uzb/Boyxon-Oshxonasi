import { authApi } from '../api/auth.api';
import { apiErrorMessage } from '../api/client';
import { useAuthStore } from '../store/auth.store';
import { useToastStore } from '../store/toast.store';

/**
 * Google'dan qaytgan xato kodini foydalanuvchiga tushunarli matnga aylantiradi.
 * (Server cb'da `?error=<kod>` bilan qaytaradi: routes/auth.routes.ts, auth.controller.ts)
 */
const GOOGLE_ERROR_TEXT: Record<string, string> = {
  google: 'Google orqali kirish amalga oshmadi',
  google_not_configured: 'Google hozircha sozlanmagan',
  blocked: 'Hisobingiz bloklangan',
  admin_password_only: 'Admin panelga faqat parol bilan kiriladi',
};

export function googleErrorMessage(error: string): string {
  return GOOGLE_ERROR_TEXT[error] ?? error;
}

/**
 * Google'dan qaytgan bir martalik kodni tokenga almashtirib, sessiyani o'rnatadi.
 *
 * Android'da kod ikki manbadan kelishi mumkin: WebBrowser promisi ham,
 * deep-link sahifasi (auth/callback) ham. Bir martalik kod takror
 * ishlatilmasligi uchun bir xil kod uchun yagona so'rov yuboriladi.
 *
 * @returns true — kirdi; false — xato (toast ko'rsatilgan bo'ladi).
 */
let inflight: { code: string; promise: Promise<boolean> } | null = null;

export function completeGoogleLogin(code: string): Promise<boolean> {
  if (inflight && inflight.code === code) return inflight.promise;

  const entry: { code: string; promise: Promise<boolean> } = {
    code,
    promise: undefined as unknown as Promise<boolean>,
  };
  entry.promise = (async (): Promise<boolean> => {
    try {
      const res = await authApi.googleExchange(code);
      await useAuthStore.getState().applySession(res.data);
      useToastStore.getState().show('Kirdingiz!', 'success');
      return true;
    } catch (e) {
      useToastStore.getState().show(apiErrorMessage(e, 'Google orqali kirish amalga oshmadi'), 'error');
      return false;
    } finally {
      if (inflight === entry) inflight = null;
    }
  })();

  inflight = entry;
  return entry.promise;
}
