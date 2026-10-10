import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Ism kamida 2 harf').max(80),
  email: z.string().email('Email noto‘g‘ri'),
  phone: z.string().optional(),
  password: z.string().min(6, 'Parol kamida 6 belgi').max(100),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const forgotSchema = z.object({ email: z.string().email() });

export const resetSchema = z.object({ password: z.string().min(6).max(100) });

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1),
  newPassword: z.string().min(6).max(100),
});
