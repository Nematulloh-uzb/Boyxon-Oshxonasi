import { api } from './axios';
import type { ApiOk, Order, Paginated } from '../types';

export interface CreateOrderBody {
  items: { dish: string; quantity: number; customizations?: string }[];
  deliveryType: 'delivery' | 'pickup';
  address?: { label?: string; address?: string; lat?: number; lng?: number };
  paymentMethod: 'payme' | 'click' | 'uzum' | 'cash' | 'card';
  promoCode?: string;
  notes?: string;
}

export const ordersApi = {
  create: (body: CreateOrderBody) =>
    api.post<ApiOk<Order>>('/orders', body).then((r) => r.data),
  detail: (id: string) => api.get<ApiOk<Order>>(`/orders/${id}`).then((r) => r.data),
  cancel: (id: string, reason?: string) =>
    api.patch<ApiOk<Order>>(`/orders/${id}/cancel`, { reason }).then((r) => r.data),
  review: (id: string, reviews: { dish: string; rating: number; comment?: string }[]) =>
    api.post<ApiOk<unknown>>(`/orders/${id}/review`, { reviews }).then((r) => r.data),
  myOrders: (page = 1, limit = 10) =>
    api.get<Paginated<Order>>('/users/me/orders', { params: { page, limit } }).then((r) => r.data),
};
