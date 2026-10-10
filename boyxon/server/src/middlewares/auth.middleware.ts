import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';
import type { AuthRequest } from '../types/express';

export function signAccess(payload: { id: string; role: string }): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES as jwt.SignOptions['expiresIn'],
  });
}

export function signRefresh(payload: { id: string }): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES as jwt.SignOptions['expiresIn'],
  });
}

export function verifyAccess(token: string): { id: string; role: string } {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as { id: string; role: string };
}

export function verifyRefresh(token: string): { id: string } {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as { id: string };
}

/** JWT access tokenni tekshiradi, req.user ni o'rnatadi. */
export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    throw ApiError.unauthorized('Token topilmadi');
  }
  try {
    const decoded = verifyAccess(header.slice(7));
    (req as AuthRequest).user = { id: decoded.id, role: decoded.role as 'user' | 'admin' };
    next();
  } catch {
    throw ApiError.unauthorized('Token yaroqsiz yoki muddati o‘tgan');
  }
}
