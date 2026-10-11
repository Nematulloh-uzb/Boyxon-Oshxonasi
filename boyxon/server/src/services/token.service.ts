import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export function signAccessToken(payload: { id: string; role: string }): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES as jwt.SignOptions['expiresIn'],
  });
}

export function signRefreshToken(payload: { id: string }): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES as jwt.SignOptions['expiresIn'],
  });
}

export function verifyRefreshToken(token: string): { id: string } {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as { id: string };
}

/**
 * Refresh cookie sozlamalari.
 * - Dev (localhost): sameSite 'lax' — OAuth top-level redirect'da cookie o'rnatiladi.
 * - Prod (Vercel + Railway = cross-site): sameSite 'none' + secure kerak,
 *   aks holda cross-site so'rovda cookie yuborilmaydi va refresh ishlamaydi.
 */
export function refreshCookieOptions() {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? ('none' as const) : ('lax' as const),
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/api/auth',
  };
}
