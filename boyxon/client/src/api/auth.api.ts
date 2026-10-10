import { api } from './axios';
import type { ApiOk, User } from '../types';

export const authApi = {
  register: (body: { name: string; email: string; phone?: string; password: string }) =>
    api.post<ApiOk<{ accessToken: string; user: User }>>('/auth/register', body).then((r) => r.data),
  login: (body: { email: string; password: string }) =>
    api.post<ApiOk<{ accessToken: string; user: User }>>('/auth/login', body).then((r) => r.data),
  logout: () => api.post('/auth/logout').then((r) => r.data),
  me: () => api.get<ApiOk<User>>('/auth/me').then((r) => r.data),
  googleUrl: () => `${api.defaults.baseURL?.replace(/\/api$/, '')}/api/auth/google`,
  changePassword: (body: { oldPassword: string; newPassword: string }) =>
    api.patch('/auth/change-password', body).then((r) => r.data),
};
