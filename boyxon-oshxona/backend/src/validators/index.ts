import { z } from 'zod';

// Telefon: har doim "+998 XX XXX XX XX" (XATO 8 tuzatish)
export const telefonSxema = z
  .string({ required_error: "Telefon kiritilishi shart" })
  .regex(/^\+998 \d{2} \d{3} \d{2} \d{2}$/, {
    message: "Telefon +998 XX XXX XX XX ko'rinishida bo'lsin",
  });

// Parol: kamida 6 belgi
export const parolSxema = z
  .string({ required_error: 'Parol kiritilishi shart' })
  .min(6, "Parol kamida 6 belgidan iborat bo'lsin")
  .max(64, 'Parol juda uzun');

// Ism: 2-60 belgi
export const ismSxema = z
  .string({ required_error: 'Ism kiritilishi shart' })
  .trim()
  .min(2, 'Ism kamida 2 harf bo‘lsin')
  .max(60, 'Ism juda uzun');

// OTP: 6 xonali raqam
export const otpSxema = z
  .string({ required_error: 'Tasdiqlash kodi kiritilishi shart' })
  .regex(/^\d{6}$/, { message: 'Kod 6 xonali raqam bo‘lsin' });

// --- Auth ---
export const royxatSxema = z.object({
  ism: ismSxema,
  telefon: telefonSxema,
  parol: parolSxema,
});

export const kirishSxema = z.object({
  telefon: telefonSxema,
  parol: z.string({ required_error: 'Parol kiritilishi shart' }).min(1, 'Parol kiritilishi shart'),
});

export const otpSorashSxema = z.object({
  telefon: telefonSxema,
  maqsad: z.enum(['royxat', 'tiklash', 'kirish']).default('royxat'),
});

export const otpTasdiqSxema = z.object({
  telefon: telefonSxema,
  kod: otpSxema,
  maqsad: z.enum(['royxat', 'tiklash', 'kirish']).default('royxat'),
});

export const parolTiklashSxema = z.object({
  telefon: telefonSxema,
  kod: otpSxema,
  yangiParol: parolSxema,
});

// --- Mahsulot / Kategoriya query ---
export const katalogQuerySxema = z.object({
  kategoriya: z.string().optional(),
  qidiruv: z.string().max(100).optional(),
  mashhur: z.union([
    z.boolean(),
    z.enum(['true', 'false']).transform((qiymat) => qiymat === 'true'),
  ]).optional(),
  sahifa: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

// --- Buyurtma ---
export const buyurtmaMahsulotSxema = z.object({
  mahsulot: z.string().min(1, 'Mahsulot tanlanishi shart'),
  soni: z.number().int().min(1, 'Soni kamida 1 bo‘lsin').max(50, 'Soni ko‘pi 50 ta'),
});

export const buyurtmaSxema = z.object({
  mahsulotlar: z.array(buyurtmaMahsulotSxema).min(1, 'Savatcha bo‘sh bo‘lmasligi kerak'),
  manzil: z.string().trim().min(5, 'Manzil to‘liq yozilsin').max(200),
  moljal: z.string().trim().max(200).optional(),
  telefon: telefonSxema,
  tolovUsuli: z.enum(['naqd', 'karta', 'click', 'payme']).default('naqd'),
  promoKod: z.string().trim().max(20).optional(),
  izoh: z.string().trim().max(500).optional(),
});

// --- Promo ---
export const promoTekshirSxema = z.object({
  kod: z.string().trim().min(3, 'Promo-kod kiritilsin').max(20).toUpperCase(),
  summa: z.number().min(0, 'Summa noto‘g‘ri'),
});

export type RoyxatKiritish = z.infer<typeof royxatSxema>;
export type KirishKiritish = z.infer<typeof kirishSxema>;
export type BuyurtmaKiritish = z.infer<typeof buyurtmaSxema>;
