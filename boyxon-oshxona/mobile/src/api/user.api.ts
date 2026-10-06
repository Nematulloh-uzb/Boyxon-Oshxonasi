import { api } from './client';

// Profil va manzillar API
export async function profilOlish() {
  const javob = await api.get('/user/profil');
  return javob.data.foydalanuvchi;
}

export async function profilYangilash(data: { ism?: string; til?: 'uz' | 'ru' | 'en'; bildirishnoma?: boolean }) {
  const javob = await api.patch('/user/profil', data);
  return javob.data.foydalanuvchi;
}

export async function manzillarOlish() {
  const javob = await api.get('/user/manzillar');
  return javob.data.manzillar;
}
