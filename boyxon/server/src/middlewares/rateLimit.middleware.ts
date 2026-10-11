import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  // 404/opsiyalangan xatolar ham limitni yemasligi uchun faqat muvaffaqiyatli
  // bo'lmagan auth urinishlar alohida hisoblanadi (authLimiter ga qarang)
  skipFailedRequests: false,
  message: { success: false, message: 'Juda ko‘p so‘rov — 15 daqiqadan keyin urinib ko‘ring', data: null },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 50,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'Juda ko‘p urinish — keyinroq qayting', data: null },
});
