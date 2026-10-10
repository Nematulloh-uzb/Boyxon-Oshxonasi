import { api } from './axios';
import type { ApiOk, AppNotification, Paginated } from '../types';

export const notificationsApi = {
  list: (page = 1, limit = 20) =>
    api.get<Paginated<AppNotification>>('/notifications', { params: { page, limit } }).then((r) => r.data),
  unreadCount: () => api.get<ApiOk<{ count: number }>>('/notifications/unread-count').then((r) => r.data),
  readAll: () => api.patch('/notifications/read-all').then((r) => r.data),
  readOne: (id: string) => api.patch(`/notifications/${id}/read`).then((r) => r.data),
  remove: (id: string) => api.delete(`/notifications/${id}`).then((r) => r.data),
};

export const pushApi = {
  vapidKey: () => api.get<ApiOk<{ key: string }>>('/push/vapid-public-key').then((r) => r.data),
  subscribe: (body: { endpoint: string; keys: { p256dh: string; auth: string }; userAgent?: string }) =>
    api.post('/push/subscribe', body).then((r) => r.data),
  unsubscribe: (endpoint: string) => api.post('/push/unsubscribe', { endpoint }).then((r) => r.data),
};
