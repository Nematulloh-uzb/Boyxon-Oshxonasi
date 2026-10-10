import { create } from 'zustand';
import type { AppNotification } from '../types';

interface NotifState {
  items: AppNotification[];
  unread: number;
  setItems: (items: AppNotification[]) => void;
  setUnread: (n: number) => void;
  pushOne: (n: AppNotification) => void;
  markAll: () => void;
}

export const useNotifStore = create<NotifState>()((set) => ({
  items: [],
  unread: 0,
  setItems: (items) => set({ items }),
  setUnread: (unread) => set({ unread }),
  pushOne: (n) => set((s) => ({ items: [n, ...s.items], unread: s.unread + 1 })),
  markAll: () => set((s) => ({ items: s.items.map((i) => ({ ...i, isRead: true })), unread: 0 })),
}));
