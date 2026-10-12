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
  nameRu?: string;
  nameEn?: string;
  slug: string;
  description: string;
  descriptionRu?: string;
  descriptionEn?: string;
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

export type OrderStatus = 'pending' | 'confirmed' | 'packing' | 'handed_to_taxi' | 'delivered' | 'cancelled';

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
  taxi?: { driver?: string; carNumber?: string; service?: string; note?: string };
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

// ── Chat (real-time user ↔ admin suhbat) ──
export interface ChatUser {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string | null;
}

export interface ChatMessage {
  _id: string;
  conversation: string;
  sender: string | ChatUser;
  senderRole: 'user' | 'admin';
  text: string;
  readAt?: string | null;
  createdAt: string;
}

export interface ChatConversation {
  _id: string;
  user: string | ChatUser;
  lastMessage?: string;
  lastSenderRole?: 'user' | 'admin';
  lastMessageAt?: string;
  adminUnread: number;
  userUnread: number;
  createdAt: string;
  updatedAt: string;
}

/** GET /chat/me va admin GET /chat/conversations/:id javobi. */
export interface ChatThreadResponse {
  conversation: ChatConversation;
  messages: ChatMessage[];
}

export interface ApiOk<T> {
  success: boolean;
  message: string;
  data: T;
}

// ── Chat (real-time) ──
export interface ChatMessage {
  _id: string;
  conversation: string;
  sender: string | { _id?: string; name?: string; avatar?: string | null };
  senderRole: 'user' | 'admin';
  text: string;
  readAt: string | null;
  createdAt: string;
}

export interface ChatUser {
  _id: string;
  name: string;
  email?: string;
  avatar?: string | null;
  phone?: string;
}

export interface ChatConversation {
  _id: string;
  user: string | ChatUser;
  lastMessage: string;
  lastSenderRole?: 'user' | 'admin';
  lastMessageAt?: string;
  adminUnread: number;
  userUnread: number;
  createdAt: string;
  updatedAt: string;
}


