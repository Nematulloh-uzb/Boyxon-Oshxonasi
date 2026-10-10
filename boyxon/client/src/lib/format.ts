/** 45000 -> "45 000 so'm" */
export function formatPrice(value: number): string {
  return `${Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} so'm`;
}

/** ISO sana -> "9 okt, 14:30" */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('uz-UZ', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export const ORDER_STATUS_LABEL: Record<string, string> = {
  pending: 'Kutilmoqda',
  confirmed: 'Tasdiqlandi',
  preparing: 'Tayyorlanmoqda',
  on_way: 'Yo‘lda',
  delivered: 'Yetkazildi',
  cancelled: 'Bekor qilindi',
};
