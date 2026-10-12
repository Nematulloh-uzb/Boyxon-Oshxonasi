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
      // Full logout: local + server cookie. Server chaqiruvini AXIOS SIZ bajaramiz
      // (fetch + credentials:include) — chunki axios'ning o'zi 401 refresh logikasi
      // bilan poygaga kirishib "authda ushlab turadi" effektini beradi.
      logoutServer: async () => {
        // 1) Avval local tozalaymiz — 401 interceptor refresh loop qilmasligi uchun
        set({ user: null, accessToken: null });
        try {
          const base =
            (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ??
            'http://localhost:5000/api';
          await fetch(`${base}/auth/logout`, { method: 'POST', credentials: 'include' });
        } catch {
          // Server o'chiq bo'lsa ham local tozalanadi
        }
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
