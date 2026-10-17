import { api } from './client';
import type {
  Address,
  ApiOk,
  AppNotification,
  NotificationPrefs,
  Paginated,
  User,
  UserPrefs,
} from './types';

export const usersApi = {
  me: () => api.get<ApiOk<User>>('/users/me').then((r) => r.data),
  updateMe: (body: Partial<Pick<User, 'name' | 'phone' | 'avatar'>>) =>
    api.patch<ApiOk<User>>('/users/me', body).then((r) => r.data),
  updatePrefs: (body: Partial<UserPrefs>) =>
    api.patch<ApiOk<UserPrefs>>('/users/me/preferences', body).then((r) => r.data),
  updateNotifPrefs: (body: Partial<NotificationPrefs>) =>
    api.patch<ApiOk<NotificationPrefs>>('/users/me/notification-prefs', body).then((r) => r.data),
  addAddress: (body: Omit<Address, '_id'>) =>
    api.post<ApiOk<Address[]>>('/users/me/addresses', body).then((r) => r.data),
  updateAddress: (id: string, body: Partial<Omit<Address, '_id'>>) =>
    api.patch<ApiOk<Address[]>>(`/users/me/addresses/${id}`, body).then((r) => r.data),
  deleteAddress: (id: string) =>
    api.delete<ApiOk<Address[]>>(`/users/me/addresses/${id}`).then((r) => r.data),
  toggleFavorite: (dishId: string) =>
    api.post<ApiOk<{ favored: boolean }>>(`/users/me/favorites/${dishId}`).then((r) => r.data),
  myNotifications: (page = 1, limit = 20) =>
    api
      .get<Paginated<AppNotification>>('/users/me/notifications', { params: { page, limit } })
      .then((r) => r.data),
};

export const promosApi = {
  validate: (code: string, subtotal: number) =>
    api
      .post<ApiOk<{ code: string; discount: number; description?: string }>>('/promos/validate', {
        code,
        subtotal,
      })
      .then((r) => r.data),
};
