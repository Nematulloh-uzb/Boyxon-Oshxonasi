import { z } from 'zod';

/**
 * Parol siyosati: kamida 8 belgi, harf va raqam aralash.
 * 6 belgili "123456" tipidagi parollar bir necha soniyada buziladi.
 */
/**
 * Telefon: O'zbekiston formati ustuvor (+998 XX XXX XX XX), xalqaro ham ruxsat.
 * Bir xil raqam ikki hisobda bo'lmasligi uchun User.phone sparse+unique
 * (model'da) — bu yerda faqat format tekshiriladi.
 */
const phoneSchema = z
  .string()
  .trim()
  .regex(
    /^(\+998\s?\d{2}\s?\d{3}\s?\d{2}\s?\d{2}|\+?[0-9\s()\-]{7,20})$/,
    'Telefon +998 XX XXX XX XX formatda bo‘lsin',
  )
  .optional();

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

/** Reset tokeni — info va reset endpoint'lari uchun bitta sxema. */
export const resetTokenParamsSchema = z.object({
  token: z.string().min(20, 'Token noto‘g‘ri').max(500),
});
