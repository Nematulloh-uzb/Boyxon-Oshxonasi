import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { clearTokenStorage, setRefreshToken, setStoredAccessToken } from '../lib/tokenStorage';
import type { AuthPayload, User } from '../api/types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  /** Sessiya tekshiruvi tugaguncha false — guard'lar /kirish'ga sakramasligi uchun. */
  sessionReady: boolean;
  setUser: (u: User | null) => void;
  setToken: (t: string | null) => void;
  setSessionReady: (ready: boolean) => void;
  /** Login/register/refresh javobini to'liq qo'llash (token + user + refresh). */
  applySession: (payload: AuthPayload, opts?: { persistRefresh?: boolean }) => Promise<void>;
  logout: () => Promise<void>;
}

const DEFAULT_PREFS: User['preferences'] = { language: 'uz', theme: 'light', fontSize: 'medium' };
const DEFAULT_NOTIF: User['notificationPrefs'] = { pushEnabled: true };

/** Eski/eski server user'ida maydonlar yetishmasa — default bilan to'ldirish. */
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
      sessionReady: false,
      setUser: (user) => set({ user: normalizeUser(user) }),
      setToken: (accessToken) => {
        set({ accessToken });
        void setStoredAccessToken(accessToken);
      },
      setSessionReady: (sessionReady) => set({ sessionReady }),
      applySession: async (payload, opts) => {
        set({
          accessToken: payload.accessToken,
          user: normalizeUser(payload.user),
          sessionReady: true,
        });
        await setStoredAccessToken(payload.accessToken);
        if (payload.refreshToken) {
          await setRefreshToken(payload.refreshToken, opts?.persistRefresh);
        } else if (opts?.persistRefresh === false) {
          await setRefreshToken(null, false);
        }
      },
      logout: async () => {
        set({ user: null, accessToken: null, sessionReady: true });
        await clearTokenStorage();
      },
    }),
    {
      name: 'boyxon-auth',
      storage: createJSONStorage(() => AsyncStorage),
      /** Faqat user saqlanadi (tez ishga tushish uchun); tokenlar SecureStore'da. */
      partialize: (state) => ({ user: state.user }) as never,
      merge: (persisted, current) => {
        const p = persisted as Partial<AuthState> | undefined;
        return {
          ...current,
          user: normalizeUser((p?.user as User | null) ?? null),
        };
      },
    },
  ),
);
