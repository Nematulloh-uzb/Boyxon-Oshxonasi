import type { OrderStatus } from '../api/types';

/** Buyurtma trekkeri bosqichlari (dizayn 03 muvaffaqiyat modali bilan aynan). */
export const ORDER_STEPS = ['Qabul qilindi', 'Oshxonada', "Yo'lda", 'Yetkazildi'];

export const ORDER_STATUS_INDEX: Record<OrderStatus, number> = {
  pending: 0,
  confirmed: 0,
  packing: 1,
  handed_to_taxi: 2,
  delivered: 3,
  cancelled: 0,
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Yangi',
  confirmed: 'Tasdiqlandi',
  packing: 'Tayyorlanmoqda',
  handed_to_taxi: "Yo'lda",
  delivered: 'Yetkazildi',
  cancelled: 'Bekor qilindi',
};

/** Yakuniy (o'zgarmaydigan) statuslar. */
export const ORDER_FINAL_STATUSES: OrderStatus[] = ['delivered', 'cancelled'];

export function isOrderFinal(status: OrderStatus): boolean {
  return status === 'delivered' || status === 'cancelled';
}
