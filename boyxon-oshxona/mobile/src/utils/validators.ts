import { z } from 'zod';

// Telefon formati — backend bilan bir xil: +998 XX XXX XX XX (XATO 8)
export const telefonSxema = z
  .string({ required_error: 'Telefon kiritilishi shart' })
  .regex(/^\+998 \d{2} \d{3} \d{2} \d{2}$/, {
    message: "Telefon +998 XX XXX XX XX ko'rinishida bo'lsin",
  });

export const parolSxema = z
  .string({ required_error: 'Parol kiritilishi shart' })
  .min(6, "Parol kamida 6 belgidan iborat bo'lsin")
  .max(64, 'Parol juda uzun');

export const ismSxema = z.string({ required_error: 'Ism kiritilishi shart' }).trim().min(2, 'Ism kamida 2 harf bo‘lsin').max(60);

export const otpSxema = z.string({ required_error: 'Kod kiritilishi shart' }).regex(/^\d{6}$/, { message: 'Kod 6 xonali bo‘lsin' });

export const kirishSxema = z.object({ telefon: telefonSxema, parol: z.string().min(1, 'Parol kiritilishi shart') });

export const royxatSxema = z
  .object({ ism: ismSxema, telefon: telefonSxema, parol: parolSxema, tasdiq: z.string() })
  .refine((v) => v.parol === v.tasdiq, { message: 'Parollar mos kelmadi', path: ['tasdiq'] });
