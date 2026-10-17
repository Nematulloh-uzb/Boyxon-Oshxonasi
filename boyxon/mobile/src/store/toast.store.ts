import { create } from 'zustand';

export type ToastKind = 'success' | 'error' | 'info';

export interface ToastItem {
  id: number;
  title: string;
  kind: ToastKind;
}

interface ToastState {
  toasts: ToastItem[];
  show: (title: string, kind?: ToastKind) => void;
  hide: (id: number) => void;
}

let seq = 0;

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  show: (title, kind = 'success') => {
    const id = ++seq;
    set({ toasts: [...get().toasts, { id, title, kind }] });
    setTimeout(() => get().hide(id), 3200);
  },
  hide: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
}));
