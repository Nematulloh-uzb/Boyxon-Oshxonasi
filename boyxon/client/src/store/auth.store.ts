import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  setUser: (u: User | null) => void;
  setToken: (t: string | null) => void;
  logout: () => void;
  logoutServer: () => Promise<void>;
}

const DEFAULT_PREFS: User['preferences'] = { language: 'uz', theme: 'dark', fontSize: 'medium' };
const DEFAULT_NOTIF: User['notificationPrefs'] = {
  pushEnabled: true,
  orderUpdates: true,
  promos: true,
  newDishes: true,
  systemMessages: true,
};

/** Eski localStorage dagi user'da preferences/notificationPrefs bo'lmasa default bilan to'ldiradi. */
function normalizeUser(u: User | null): User | null {
  if (!u) return null;
  return {
    ...u,
    addresses: u.addresses ?? [],
    favorites: u.favorites ?? [],
    bonusBalance: u.bonusBalance ?? 0,
    notificationPrefs: { ...DEFAULT_NOTIF, ...(u.notificationPrefs ?? {}) },
    preferences: { ...DEFAULT_PREFS, ...(u.preferences ?? {}) },
  };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      setUser: (user) => set({ user: normalizeUser(user) }),
      setToken: (accessToken) => set({ accessToken }),
      logout: () => set({ user: null, accessToken: null }),
      // Server'dagi refresh cookie'ni ham o'chiradi — aks holda axios 401 da
      // refresh qilib qayta login qilib qo'yadi va "authda ushlab turadi".
      logoutServer: async () => {
        try {
          // Circular import bo'lmasligi uchun dynamic import
          const { api } = await import('../api/axios');
          await api.post('/auth/logout');
        } catch {
          // Server o'chiq bo'lsa ham local tozalanadi
        }
        set({ user: null, accessToken: null });
      },
    }),
    {
      name: 'boyxon-auth',
      // Persist'dan qaytgan eski user'ni ham normalize qilish (migratsiya)
      merge: (persisted, current) => {
        const p = persisted as Partial<AuthState> | undefined;
        return {
          ...current,
          ...p,
          user: normalizeUser((p?.user as User | null) ?? null),
        };
      },
    },
  ),
);
