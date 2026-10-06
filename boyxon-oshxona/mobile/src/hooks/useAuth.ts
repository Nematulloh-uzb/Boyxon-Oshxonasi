import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { kirish, royxatdanOtish } from '../api/auth.api';
import { useAuth } from '../store/auth.store';

// Auth hook — kirish / ro'yxat / chiqish
export function useKirish() {
  const authKirish = useAuth((h) => h.kirish);
  return useMutation({
    mutationFn: ({ telefon, parol }: { telefon: string; parol: string }) => kirish(telefon, parol),
    onSuccess: async (javob) => {
      await authKirish(javob.foydalanuvchi, javob.accessToken, javob.refreshToken);
      router.replace('/(tabs)' as never);
    },
  });
}

export function useRoyxat() {
  return useMutation({
    mutationFn: ({ ism, telefon, parol }: { ism: string; telefon: string; parol: string }) =>
      royxatdanOtish(ism, telefon, parol),
  });
}

export function useChiqish() {
  const chiqish = useAuth((h) => h.chiqish);
  const mijoz = useQueryClient();
  return async () => {
    await chiqish();
    mijoz.clear();
    router.replace('/(auth)/login' as never);
  };
}
