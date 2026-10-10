import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { asyncHandler } from '../utils/asyncHandler';
import { ok } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { User } from '../models/User.model';
import { registerUser, loginUser } from '../services/auth.service';
import { signAccessToken, signRefreshToken, verifyRefreshToken, refreshCookieOptions } from '../services/token.service';
import { sendResetEmail } from '../services/email.service';
import { env } from '../config/env';
import type { AuthRequest } from '../types/express';

function setRefreshCookie(res: Response, token: string): void {
  res.cookie('refreshToken', token, refreshCookieOptions());
}

/**
 * POST /api/auth/register — yangi hisob ochish.
 * Body: { name, email, phone?, password }
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { accessToken, refreshToken } = await registerUser(req.body);
  const user = await User.findOne({ email: req.body.email.toLowerCase() });
  setRefreshCookie(res, refreshToken);
  res.status(201).json(ok({ accessToken, user }, 'Ro‘yxatdan o‘tish muvaffaqiyatli'));
});

/**
 * POST /api/auth/login — email + parol bilan kirish.
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as { email: string; password: string };
  const { accessToken, refreshToken } = await loginUser(email, password);
  const user = await User.findOne({ email: email.toLowerCase() });
  setRefreshCookie(res, refreshToken);
  res.json(ok({ accessToken, user }, 'Xush kelibsiz!'));
});

/** POST /api/auth/logout — refresh cookie ni tozalash. */
export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.clearCookie('refreshToken', { path: '/api/auth' });
  res.json(ok(null, 'Chiqish muvaffaqiyatli'));
});

/** POST /api/auth/refresh — cookie dagi refresh token orqali yangi access token. */
export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken as string | undefined;
  if (!token) throw ApiError.unauthorized('Refresh token topilmadi');
  let payload: { id: string };
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw ApiError.unauthorized('Refresh token yaroqsiz');
  }
  const user = await User.findById(payload.id);
  if (!user || !user.isActive) throw ApiError.unauthorized('Foydalanuvchi topilmadi');
  const accessToken = signAccessToken({ id: user.id as string, role: user.role });
  const refreshToken = signRefreshToken({ id: user.id as string });
  setRefreshCookie(res, refreshToken);
  res.json(ok({ accessToken, user }, 'Token yangilandi'));
});

/** GET /api/auth/me — joriy foydalanuvchi (auth talab qiladi). */
export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById((req as AuthRequest).user!.id);
  if (!user) throw ApiError.notFound('Foydalanuvchi topilmadi');
  res.json(ok(user, 'OK'));
});

/**
 * GET /api/auth/google/callback — Passport Google dan qaytganda.
 * Yangi access token + refresh cookie beradi, frontend ga redirect qiladi.
 */
export const googleCallback = asyncHandler(async (req: Request, res: Response) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = req.user as any;
  const userDoc = user?._id ? user : await User.findOne({ email: user?.email });
  if (!userDoc) throw ApiError.unauthorized('Google login xatosi');
  userDoc.lastLoginAt = new Date();
  await userDoc.save();
  const accessToken = signAccessToken({ id: userDoc.id as string, role: userDoc.role });
  setRefreshCookie(res, signRefreshToken({ id: userDoc.id as string }));
  const dest =
    userDoc.role === 'admin' ? `${env.CLIENT_URL}/admin` : `${env.CLIENT_URL}/auth/callback?token=${accessToken}`;
  res.redirect(userDoc.role === 'admin' ? `${env.CLIENT_URL}/auth/callback?token=${accessToken}&next=/admin` : dest);
});

/** POST /api/auth/forgot-password — reset havolasini emailga yuborish. */
export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body as { email: string };
  const user = await User.findOne({ email: email.toLowerCase() });
  if (user) {
    const token = jwt.sign({ id: user.id }, env.JWT_REFRESH_SECRET, { expiresIn: '15m' });
    await sendResetEmail(user.email, `${env.CLIENT_URL}/reset-password/${token}`);
  }
  res.json(ok(null, 'Agar email ro‘yxatda bo‘lsa, havola yuborildi'));
});

/** POST /api/auth/reset-password/:token — yangi parol o'rnatish. */
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token } = req.params;
  const { password } = req.body as { password: string };
  let payload: { id: string };
  try {
    payload = jwt.verify(token, env.JWT_REFRESH_SECRET) as { id: string };
  } catch {
    throw ApiError.badRequest('Havola yaroqsiz yoki muddati o‘tgan');
  }
  const user = await User.findById(payload.id);
  if (!user) throw ApiError.notFound('Foydalanuvchi topilmadi');
  user.password = password;
  await user.save();
  res.json(ok(null, 'Parol yangilandi'));
});

/** PATCH /api/auth/change-password — auth talab qiladi. */
export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const { oldPassword, newPassword } = req.body as { oldPassword: string; newPassword: string };
  const user = await User.findById((req as AuthRequest).user!.id).select('+password');
  if (!user) throw ApiError.notFound('Foydalanuvchi topilmadi');
  if (!user.password || !(await user.comparePassword(oldPassword))) {
    throw ApiError.badRequest('Eski parol noto‘g‘ri');
  }
  user.password = newPassword;
  await user.save();
  res.json(ok(null, 'Parol o‘zgartirildi'));
});
