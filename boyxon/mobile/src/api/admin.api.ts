import { api } from './client';
import type { ApiOk, Dish, Order, OrderStatus, Paginated } from './types';

/** GET /api/admin/stats — dashboard KPI lar. */
export interface AdminStats {
  users: number;
  dishes: number;
  pendingOrders: number;
  revenue: number;
  ordersCount: number;
  recentOrders: Order[];
}

export interface AdminOrdersParams {
  page?: number;
  limit?: number;
  /** undefined — barcha statuslar */
  status?: OrderStatus;
}

export const adminApi = {
  stats: () => api.get<ApiOk<AdminStats>>('/admin/stats').then((r) => r.data),

  orders: (params: AdminOrdersParams = {}) =>
    api.get<Paginated<Order>>('/admin/orders', { params }).then((r) => r.data),

  updateOrderStatus: (id: string, status: OrderStatus, note?: string) =>
    api.patch<ApiOk<Order>>(`/admin/orders/${id}/status`, { status, note }).then((r) => r.data),

  dishes: (params: { page?: number; limit?: number } = {}) =>
    api.get<Paginated<Dish>>('/admin/dishes', { params }).then((r) => r.data),

  toggleDish: (id: string) =>
    api.patch<ApiOk<Dish>>(`/admin/dishes/${id}/toggle`).then((r) => r.data),

  sendPush: (body: { title: string; message: string; audience: 'all' | 'active' | 'new' }) =>
    api.post<ApiOk<{ recipients: number; sent: number }>>('/admin/push/send', body).then((r) => r.data),
};
