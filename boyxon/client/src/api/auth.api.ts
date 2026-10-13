import { api } from './axios';
import type { ApiOk, User } from '../types';

export const authApi = {
  register: (body: { name: string; email: string; phone?: string; password: string }) =>
    api
      .post<
        ApiOk<{
          /** Tasdiqlash majburiy bo'lsa `null` (token berilmaydi). */
          accessToken: string | null;
          user: User;
          verificationSent: boolean;
          verificationRequired: boolean;
          emailDelivered: boolean;
        }>
      >('/auth/register', body)
      .then((r) => r.data),
  login: (body: { email: string; password: string }) =>
    api.post<ApiOk<{ accessToken: string; user: User }>>('/auth/login', body).then((r) => r.data),
  logout: () => api.post('/auth/logout').then((r) => r.data),
  /** Barcha qurilmalardan chiqish — barcha tokenlar bekor qilinadi. */
  logoutAll: () => api.post('/auth/logout-all').then((r) => r.data),
  me: () => api.get<ApiOk<User>>('/auth/me').then((r) => r.data),
  googleUrl: () => `${api.defaults.baseURL?.replace(/\/api$/, '')}/api/auth/google`,
  /**
   * Google OAuth'dan qaytgan bir martalik kodni tokenga almashtiradi.
   * Access token URL'da yurmaydi (brauzer tarixi/log/Referer orqali oqib ketmasligi uchun).
   */
  googleExchange: (code: string) =>
    api.post<ApiOk<{ accessToken: string; user: User }>>('/auth/google/exchange', { code }).then((r) => r.data),
  /** Email tasdiqlash havolasidagi tokenni yuborish. */
  verifyEmail: (token: string) =>
    api.post<ApiOk<{ email: string; alreadyVerified?: boolean }>>(`/auth/verify-email/${encodeURIComponent(token)}`).then((r) => r.data),
  /** Tasdiqlash xatini qayta yuborish (cheklangan: soatiga 5 marta). */
  resendVerification: (email: string) =>
    api.post<ApiOk<null>>('/auth/resend-verification', { email }).then((r) => r.data),
  /** Parolni tiklash — reset havolasini emailga yuborish (javob har doim bir xil). */
  forgotPassword: (email: string) =>
    api.post<ApiOk<null>>('/auth/forgot-password', { email }).then((r) => r.data),
  /** Yangi parol o'rnatish (token URL'dan, 15 daqiqa amal qiladi, bir martalik). */
  resetPassword: (token: string, password: string) =>
    api.post<ApiOk<null>>(`/auth/reset-password/${encodeURIComponent(token)}`, { password }).then((r) => r.data),
  /**
   * Reset havolasi kimniki ekanini bilish (parolni o'zgartirmaydi).
   * Sahifa ochilganda qaysi email uchunligi ko'rsatiladi.
   */
  resetPasswordInfo: (token: string) =>
    api.get<ApiOk<{ email: string }>>(`/auth/reset-password/${encodeURIComponent(token)}/info`).then((r) => r.data),
  changePassword: (body: { oldPassword: string; newPassword: string }) =>
    api.patch<ApiOk<{ accessToken: string }>>('/auth/change-password', body).then((r) => r.data),
};
