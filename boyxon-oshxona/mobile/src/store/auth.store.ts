import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KALIT = 'boyxon-access-token';
const REFRESH_KALIT = 'boyxon-refresh-token';
const FOYDALANUVCHI_KALIT = 'boyxon-user';

export interface Foydalanuvchi {
  id: string;
  ism: string;
  telefon: string;
  rol: string;
}

interface AuthHolati {
  foydalanuvchi: Foydalanuvchi | null;
  token: string | null;
  tayyormi: boolean;
  yuklashXatosi: string | null;
  kirish: (f: Foydalanuvchi, token: string, refresh: string) => Promise<void>;
  chiqish: () => Promise<void>;
  yuklash: () => Promise<void>;
}

export async function tokenlarniSaqlash(token: string, refresh: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(TOKEN_KALIT, token);
    await SecureStore.setItemAsync(REFRESH_KALIT, refresh);
  } catch (xato) {
    await Promise.all([
      SecureStore.deleteItemAsync(TOKEN_KALIT),
      SecureStore.deleteItemAsync(REFRESH_KALIT),
    ]);
    useAuth.setState({ token: null });
    throw xato;
  }
  useAuth.setState({ token });
}

export async function saqlanganToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KALIT);
}

export async function saqlanganRefreshToken(): Promise<string | null> {
  return SecureStore.getItemAsync(REFRESH_KALIT);
}

export const useAuth = create<AuthHolati>()((set) => ({
  foydalanuvchi: null,
  token: null,
  tayyormi: false,
  yuklashXatosi: null,

  kirish: async (foydalanuvchi, token, refresh) => {
    await tokenlarniSaqlash(token, refresh);
    try {
      await SecureStore.setItemAsync(FOYDALANUVCHI_KALIT, JSON.stringify(foydalanuvchi));
    } catch (xato) {
      await Promise.all([
        SecureStore.deleteItemAsync(TOKEN_KALIT),
        SecureStore.deleteItemAsync(REFRESH_KALIT),
        SecureStore.deleteItemAsync(FOYDALANUVCHI_KALIT),
      ]);
      set({ foydalanuvchi: null, token: null });
      throw xato;
    }
    set({ foydalanuvchi, token, tayyormi: true });
  },

  chiqish: async () => {
    await Promise.all([
      SecureStore.deleteItemAsync(TOKEN_KALIT),
      SecureStore.deleteItemAsync(REFRESH_KALIT),
      SecureStore.deleteItemAsync(FOYDALANUVCHI_KALIT),
    ]);
    set({ foydalanuvchi: null, token: null, tayyormi: true, yuklashXatosi: null });
  },

  yuklash: async () => {
    set({ tayyormi: false, yuklashXatosi: null });
    try {
      const [token, foydalanuvchiJson] = await Promise.all([
        SecureStore.getItemAsync(TOKEN_KALIT),
        SecureStore.getItemAsync(FOYDALANUVCHI_KALIT),
      ]);

      let foydalanuvchi: Foydalanuvchi | null = null;
      if (foydalanuvchiJson) {
        const qiymat: unknown = JSON.parse(foydalanuvchiJson);
        if (
          typeof qiymat === 'object' &&
          qiymat !== null &&
          'id' in qiymat &&
          'ism' in qiymat &&
          'telefon' in qiymat &&
          'rol' in qiymat &&
          typeof qiymat.id === 'string' &&
          typeof qiymat.ism === 'string' &&
          typeof qiymat.telefon === 'string' &&
          typeof qiymat.rol === 'string'
        ) {
          foydalanuvchi = qiymat;
        } else {
          throw new Error('Saqlangan foydalanuvchi ma’lumoti yaroqsiz.');
        }
      }

      set({ token, foydalanuvchi, tayyormi: true, yuklashXatosi: null });
    } catch (xato) {
      set({
        token: null,
        foydalanuvchi: null,
        tayyormi: true,
        yuklashXatosi: xato instanceof Error ? xato.message : 'Saqlangan hisob ma’lumoti yuklanmadi.',
      });
    }
  },
}));
