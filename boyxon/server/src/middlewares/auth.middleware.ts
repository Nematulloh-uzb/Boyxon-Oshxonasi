import type { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { User } from '../models/User.model';
import { verifyAccessToken } from '../services/token.service';
import type { AuthRequest } from '../types/express';

/**
 * JWT access tokenni tekshiradi VA foydalanuvchi holatini bazadan tasdiqlaydi.
 *
 * Nega bazaga murojaat qilinadi? Faqat imzoni tekshirish yetarli emas edi:
 * foydalanuvchi bloklangan yoki paroli almashtirilgan bo'lsa ham, eski access token
 * muddati tugagunga qadar (15 daqiqa) ishlashda davom etardi. Endi har so'rovda
 * `tokenVersion` va `isActive` tekshiriladi — bekor qilish bir zumda kuchga kiradi.
 */
export async function requireAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) throw ApiError.unauthorized('Token topilmadi');

    let payload;
    try {
      payload = verifyAccessToken(header.slice(7));
    } catch {
      throw ApiError.unauthorized('Token yaroqsiz yoki muddati o‘tgan');
    }

    const user = await User.findById(payload.id).select('role isActive tokenVersion');
    if (!user) throw ApiError.unauthorized('Foydalanuvchi topilmadi');
    if (!user.isActive) throw ApiError.forbidden('Hisob bloklangan');
    if ((user.tokenVersion ?? 0) !== payload.ver) {
      throw ApiError.unauthorized('Sessiya bekor qilingan — qaytadan kiring');
    }

    // Rol bazadan olinadi: token eskirgan bo'lsa ham huquq noto'g'ri oshib ketmaydi.
    (req as AuthRequest).user = { id: payload.id, role: user.role };
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Ixtiyoriy autentifikatsiya: token bo'lsa userni o'rnatadi, bo'lmasa davom etadi.
 * Ommaviy sahifalarda "mening holatim" ma'lumotini ko'rsatish uchun.
 */
export async function optionalAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return next();
  try {
    const payload = verifyAccessToken(header.slice(7));
    const user = await User.findById(payload.id).select('role isActive tokenVersion');
    if (user && user.isActive && (user.tokenVersion ?? 0) === payload.ver) {
      (req as AuthRequest).user = { id: payload.id, role: user.role };
    }
  } catch {
    // Jimgina o'tkazib yuboramiz — bu ixtiyoriy tekshiruv.
  }
  next();
}
