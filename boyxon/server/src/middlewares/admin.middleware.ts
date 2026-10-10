import type { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import type { AuthRequest } from '../types/express';

/** Faqat admin roliga ruxsat. requireAuth dan keyin ishlatiladi. */
export function requireAdmin(req: Request, _res: Response, next: NextFunction): void {
  const user = (req as AuthRequest).user;
  if (!user) throw ApiError.unauthorized();
  if (user.role !== 'admin') throw ApiError.forbidden('Admin huquqi kerak');
  next();
}
