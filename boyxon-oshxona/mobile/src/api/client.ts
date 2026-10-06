import axios, { type InternalAxiosRequestConfig } from 'axios';
import { router } from 'expo-router';
import { Platform } from 'react-native';
import {
  saqlanganRefreshToken,
  saqlanganToken,
  tokenlarniSaqlash,
  useAuth,
} from '../store/auth.store';

const API_URL =
  process.env.EXPO_PUBLIC_API_URL ??
  Platform.select({
    ios: 'http://localhost:4000/api',
    android: 'http://10.0.2.2:4000/api',
    default: 'http://localhost:4000/api',
  });

export const api = axios.create({ baseURL: API_URL, timeout: 15000 });

let tokenYangilashJarayoni: Promise<string | null> | null = null;

async function tokenYangilash(): Promise<string | null> {
  if (!tokenYangilashJarayoni) {
    tokenYangilashJarayoni = (async () => {
      const refreshToken = await saqlanganRefreshToken();
      if (!refreshToken) return null;

      const javob = await axios.post<{ accessToken: string; refreshToken: string }>(
        `${API_URL}/auth/yangilash`,
        { refreshToken },
        { timeout: 15000 },
      );

      await tokenlarniSaqlash(javob.data.accessToken, javob.data.refreshToken);
      return javob.data.accessToken;
    })().finally(() => {
      tokenYangilashJarayoni = null;
    });
  }

  return tokenYangilashJarayoni;
}

api.interceptors.request.use(async (config) => {
  const token = await saqlanganToken();
  if (token) config.headers.set('Authorization', 'Bearer ' + token);
  return config;
});

api.interceptors.response.use(
  (javob) => javob,
  async (xato: unknown) => {
    if (!axios.isAxiosError(xato) || xato.response?.status !== 401) throw xato;

    const config = xato.config as (InternalAxiosRequestConfig & { qaytaUrinish?: boolean }) | undefined;
    const ochiqAuthYollari = [
      '/auth/kirish',
      '/auth/royxat',
      '/auth/otp-sorash',
      '/auth/otp-tasdiq',
      '/auth/parol-tiklash',
      '/auth/yangilash',
    ];
    if (
      !config ||
      config.qaytaUrinish ||
      ochiqAuthYollari.some((yol) => config.url?.includes(yol))
    ) {
      throw xato;
    }

    config.qaytaUrinish = true;
    let token: string | null;

    try {
      token = await tokenYangilash();
    } catch (yangilashXatosi) {
      if (
        axios.isAxiosError(yangilashXatosi) &&
        (yangilashXatosi.response?.status === 401 || yangilashXatosi.response?.status === 403)
      ) {
        await useAuth.getState().chiqish();
        router.replace('/(auth)/login' as never);
      }
      throw yangilashXatosi;
    }

    if (!token) {
      await useAuth.getState().chiqish();
      router.replace('/(auth)/login' as never);
      throw xato;
    }

    config.headers.set('Authorization', 'Bearer ' + token);
    return api.request(config);
  },
);
