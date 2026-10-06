import { api } from './client';
import type { Foydalanuvchi } from '../store/auth.store';

// XATO 6, 7, 8 tuzatish: OTP + Telegram + Zod validatsiya backend'da
export async function royxatdanOtish(ism: string, telefon: string, parol: string) {
  const { data } = await api.post('/auth/royxat', { ism, telefon, parol });
  return data;
}

export async function kirish(telefon: string, parol: string) {
  const { data } = await api.post('/auth/kirish', { telefon, parol });
  return data as { accessToken: string; refreshToken: string; foydalanuvchi: Foydalanuvchi };
}

export async function authFoydalanuvchiOlish(): Promise<Foydalanuvchi> {
  const { data } = await api.get('/auth/men');
  const foydalanuvchi = data.foydalanuvchi as {
    _id?: string;
    id?: string;
    ism?: string;
    telefon?: string;
    rol?: string;
  };

  if (!foydalanuvchi?._id && !foydalanuvchi?.id) {
    throw new Error('Foydalanuvchi ma’lumoti topilmadi.');
  }
  if (!foydalanuvchi.ism || !foydalanuvchi.telefon || !foydalanuvchi.rol) {
    throw new Error('Foydalanuvchi ma’lumoti to‘liq emas.');
  }

  return {
    id: foydalanuvchi._id ?? foydalanuvchi.id!,
    ism: foydalanuvchi.ism,
    telefon: foydalanuvchi.telefon,
    rol: foydalanuvchi.rol,
  };
}

export async function otpSorash(telefon: string, maqsad: 'royxat' | 'tiklash' | 'kirish' = 'tiklash') {
  const { data } = await api.post('/auth/otp-sorash', { telefon, maqsad });
  return data;
}

export async function otpTasdiq(telefon: string, kod: string, maqsad: 'royxat' | 'tiklash' | 'kirish' = 'tiklash') {
  const { data } = await api.post('/auth/otp-tasdiq', { telefon, kod, maqsad });
  return data as { accessToken: string; refreshToken: string };
}

export async function parolTiklash(telefon: string, kod: string, yangiParol: string) {
  const { data } = await api.post('/auth/parol-tiklash', { telefon, kod, yangiParol });
  return data;
}
