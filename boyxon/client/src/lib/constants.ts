export const FREE_DELIVERY_FROM = 150000;
export const DELIVERY_FEE = 12000;

/** Payment method keys — translate in components via t(`payment.${value}`). */
export const PAYMENT_METHODS = [
  { value: 'cash' },
  { value: 'card' },
] as const;

export const QUERY_KEYS = {
  dishes: 'dishes',
  featured: 'featured',
  categories: 'categories',
  cart: 'cart',
  orders: 'orders',
  notifications: 'notifications',
  unread: 'unread-count',
  adminStats: 'admin-stats',
} as const;
