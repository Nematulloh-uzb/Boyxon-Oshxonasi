export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string | null;
  role: 'user' | 'admin';
  addresses: Address[];
  favorites: string[];
  bonusBalance: number;
  notificationPrefs: NotificationPrefs;
  preferences: UserPrefs;
  isActive: boolean;
  createdAt: string;
}

export interface Address {
  _id?: string;
  label: string;
  address: string;
  isDefault: boolean;
}

export interface NotificationPrefs {
  pushEnabled: boolean;
  orderUpdates: boolean;
  promos: boolean;
  newDishes: boolean;
  systemMessages: boolean;
}

export interface UserPrefs {
  language: 'uz' | 'ru' | 'en';
  theme: 'light' | 'dark';
  fontSize: 'small' | 'medium' | 'large';
}

export interface Category {
  _id: string;
  name: string;
  nameRu?: string;
  nameEn?: string;
  slug: string;
  icon?: string;
  order: number;
  isActive: boolean;
}

export interface Dish {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  oldPrice?: number;
  category: Category | string;
  image: string | null;
  deliveryTime: number;
  calories?: number;
  tags: string[];
  rating: number;
  reviewCount: number;
  orderCount: number;
  isActive: boolean;
  isFeatured: boolean;
}

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'on_way' | 'delivered' | 'cancelled';

export interface OrderItem {
  dish: string;
  name: string;
  price: number;
  quantity: number;
  customizations?: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  user: string | User;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  promoCode?: string;
  deliveryType: 'delivery' | 'pickup';
  address?: { label?: string; address?: string };
  paymentMethod: 'payme' | 'click' | 'uzum' | 'cash';
  paymentStatus: string;
  status: OrderStatus;
  statusHistory: { status: string; timestamp: string; note?: string }[];
  estimatedDeliveryAt?: string;
  createdAt: string;
}

export interface Promo {
  _id: string;
  code: string;
  description?: string;
  type: 'percent' | 'fixed';
  value: number;
  minOrderAmount: number;
  maxDiscount?: number;
  isActive: boolean;
}

export interface AppNotification {
  _id: string;
  type: 'order' | 'promo' | 'system' | 'new_dish' | 'bonus';
  title: string;
  message: string;
  icon?: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface Paginated<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination: { page: number; limit: number; total: number; pages: number };
}

export interface ApiOk<T> {
  success: boolean;
  message: string;
  data: T;
}
