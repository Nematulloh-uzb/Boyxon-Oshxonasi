import rateLimit from 'express-rate-limit';
import type { Request } from 'express';

/**
 * Rate limit strategiyasi:
 * - `apiLimiter` — umumiy API himoyasi (keng, ammo cheklangan).
 * - `authLimiter` — login/register: parol terish (brute-force) ga qarshi qat'iy.
 *   Muvaffaqiyatli kirishlar hisobga olinmaydi (`skipSuccessfulRequests`), shuning uchun
 *   haqiqiy foydalanuvchi hech qachon to'siqlanmaydi — faqat xato urinishlar sanaladi.
 * - `sensitiveLimiter` — parol tiklash, kod almashtirish: eng qat'iy.
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 600,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  // Brauzerning OPTIONS preflight so'rovlari limitni yemasligi uchun
  skip: (req) => req.method === 'OPTIONS',
  message: { success: false, message: 'Juda ko‘p so‘rov — 15 daqiqadan keyin urinib ko‘ring', data: null },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: (req: Request) => req.method === 'OPTIONS',
  // Faqat XATO urinishlar sanaladi — to'g'ri parol bilan kirgan mijoz bloklanmaydi.
  skipSuccessfulRequests: true,
  message: {
    success: false,
    message: 'Juda ko‘p urinish — 15 daqiqadan keyin qayta urinib ko‘ring',
    data: null,
  },
});

export const sensitiveLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: (req: Request) => req.method === 'OPTIONS',
  message: {
    success: false,
    message: 'Juda ko‘p urinish — bir soatdan keyin qayta urinib ko‘ring',
    data: null,
  },
});
