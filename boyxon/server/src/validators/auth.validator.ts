import { z } from 'zod';

/**
 * Parol siyosati: kamida 8 belgi, harf va raqam aralash.
 * 6 belgili "123456" tipidagi parollar bir necha soniyada buziladi.
 */
const passwordSchema = z
  .string()
  .min(8, 'Parol kamida 8 belgi bo‘lishi kerak')
  .max(100, 'Parol juda uzun')
  .refine((v) => /[a-zA-Z]/.test(v), 'Parolda kamida bitta harf bo‘lishi kerak')
  .refine((v) => /[0-9]/.test(v), 'Parolda kamida bitta raqam bo‘lishi kerak');

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Ism kamida 2 harf').max(80),
  email: z.string().trim().toLowerCase().email('Email noto‘g‘ri').max(160),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s()-]{7,20}$/, 'Telefon raqam formati noto‘g‘ri')
    .optional(),
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Email noto‘g‘ri').max(160),
  password: z.string().min(1, 'Parolni kiriting').max(100),
});

export const forgotSchema = z.object({ email: z.string().trim().toLowerCase().email().max(160) });

export const resetSchema = z.object({ password: passwordSchema });

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'Eski parolni kiriting').max(100),
  newPassword: passwordSchema,
});

export const googleExchangeSchema = z.object({
  code: z.string().min(10, 'Kod noto‘g‘ri').max(100),
});

/** Tasdiqlash havosini qayta yuborish. */
export const resendVerificationSchema = z.object({
  email: z.string().trim().toLowerCase().email('Email noto‘g‘ri').max(160),
});

/** Tasdiqlash havolasidagi token (JWT — uchta nuqta bilan ajratilgan). */
export const verifyEmailParamsSchema = z.object({
  token: z.string().min(20, 'Token noto‘g‘ri').max(500),
});
