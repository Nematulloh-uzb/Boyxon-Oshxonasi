import { api } from './client';
import type { ApiOk, AuthPayload, RegisterPayload, User } from './types';

export const authApi = {
  register: (body: { name: string; email: string; phone?: string; password: string }) =>
    api.post<ApiOk<RegisterPayload>>('/auth/register', body).then((r) => r.data),
  login: (body: { email: string; password: string }) =>
    api.post<ApiOk<AuthPayload>>('/auth/login', body).then((r) => r.data),
  logout: (refreshToken?: string | null) =>
    api.post('/auth/logout', refreshToken ? { refreshToken } : {}).then((r) => r.data),
  /** Barcha qurilmalardan chiqish — barcha sessiyalar bekor qilinadi. */
  logoutAll: () => api.post('/auth/logout-all').then((r) => r.data),
  me: () => api.get<ApiOk<User>>('/auth/me').then((r) => r.data),
  /** Google OAuth sahifasi (native=1 → boyxon:// deep-link bilan qaytadi). */
  googleUrl: () => `${api.defaults.baseURL?.replace(/\/api$/, '')}/api/auth/google?native=1`,
  /** Google'dan qaytgan bir martalik kodni tokenga almashtirish. */
  googleExchange: (code: string) =>
    api.post<ApiOk<AuthPayload>>('/auth/google/exchange', { code }).then((r) => r.data),
  verifyEmail: (token: string) =>
    api
      .post<ApiOk<{ email: string; alreadyVerified?: boolean }>>(
        `/auth/verify-email/${encodeURIComponent(token)}`,
      )
      .then((r) => r.data),
  resendVerification: (email: string) =>
    api.post<ApiOk<null>>('/auth/resend-verification', { email }).then((r) => r.data),
  forgotPassword: (email: string) =>
    api.post<ApiOk<null>>('/auth/forgot-password', { email }).then((r) => r.data),
  resetPassword: (token: string, password: string) =>
    api
      .post<ApiOk<null>>(`/auth/reset-password/${encodeURIComponent(token)}`, { password })
      .then((r) => r.data),
  changePassword: (body: { oldPassword: string; newPassword: string }) =>
    api.patch<ApiOk<{ accessToken: string }>>('/auth/change-password', body).then((r) => r.data),
};
