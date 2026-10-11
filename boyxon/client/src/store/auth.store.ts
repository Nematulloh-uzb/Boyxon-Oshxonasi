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
