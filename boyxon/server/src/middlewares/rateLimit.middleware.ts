import rateLimit from 'express-rate-limit';

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
  limit: 100,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: (req) => req.method === 'OPTIONS',
  message: { success: false, message: 'Juda ko‘p urinish — keyinroq qayting', data: null },
});
