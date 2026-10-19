import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ok, paginated } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { User } from '../models/User.model';
import { Order } from '../models/Order.model';
import { Notification } from '../models/Notification.model';
import { refreshCookieOptions } from '../services/token.service';
import type { AuthRequest } from '../types/express';

const uid = (req: Request): string => (req as AuthRequest).user!.id;

/** GET /api/users/me — profil. */
export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(uid(req)).populate('favorites', 'name price image slug rating');
  if (!user) throw ApiError.notFound('Foydalanuvchi topilmadi');
  res.json(ok(user, 'OK'));
});

/** PATCH /api/users/me — ism, telefon, avatar. */
export const updateMe = asyncHandler(async (req: Request, res: Response) => {
  const { name, phone, avatar } = req.body as { name?: string; phone?: string; avatar?: string | null };
  const user = await User.findByIdAndUpdate(
    uid(req),
    {
      ...(name !== undefined && { name }),
      ...(phone !== undefined && { phone }),
      ...(avatar !== undefined && { avatar }),
    },
    { new: true, runValidators: true },
  );
  res.json(ok(user, 'Profil yangilandi'));
});

/** PATCH /api/users/me/preferences — til, tema, shrift. */
export const updatePreferences = asyncHandler(async (req: Request, res: Response) => {
  const { language, theme, fontSize } = req.body as Record<string, string>;
  const user = await User.findByIdAndUpdate(
    uid(req),
    {
      ...(language && { 'preferences.language': language }),
      ...(theme && { 'preferences.theme': theme }),
      ...(fontSize && { 'preferences.fontSize': fontSize }),
    },
    { new: true },
  );
  res.json(ok(user?.preferences, 'Sozlamalar saqlandi'));
});

/** PATCH /api/users/me/notification-prefs — push sozlamalari. */
export const updateNotifPrefs = asyncHandler(async (req: Request, res: Response) => {
  const prefs = req.body as Record<string, boolean>;
  const update: Record<string, boolean> = {};
  if (typeof prefs.pushEnabled === 'boolean') update['notificationPrefs.pushEnabled'] = prefs.pushEnabled;
  const user = await User.findByIdAndUpdate(uid(req), update, { new: true });
  res.json(ok(user?.notificationPrefs, 'Bildirishnomalar yangilandi'));
});

/** POST /api/users/me/addresses — manzil qo'shish. */
export const addAddress = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(uid(req));
  if (!user) throw ApiError.notFound('Foydalanuvchi topilmadi');
  if (user.addresses.length >= 20) throw ApiError.badRequest('Ko‘pi bilan 20 ta manzil saqlash mumkin');
  const body = req.body as { label: string; address: string; lat?: number; lng?: number; isDefault?: boolean };
  if (body.isDefault) {
    user.addresses.forEach((a) => { a.isDefault = false; });
  }
  user.addresses.push({
    label: body.label,
    address: body.address,
    lat: body.lat,
    lng: body.lng,
    isDefault: Boolean(body.isDefault),
  });
  await user.save();
  res.status(201).json(ok(user.addresses, 'Manzil qo‘shildi'));
});

/** PATCH /api/users/me/addresses/:id — manzilni tahrirlash. */
export const updateAddress = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(uid(req));
  if (!user) throw ApiError.notFound('Foydalanuvchi topilmadi');
  const addr = user.addresses.find((a) => a._id?.toString() === req.params.id);
  if (!addr) throw ApiError.notFound('Manzil topilmadi');
  const body = req.body as { label?: string; address?: string; lat?: number; lng?: number; isDefault?: boolean };
  if (body.label !== undefined) addr.label = body.label;
  if (body.address !== undefined) addr.address = body.address;
  if (body.lat !== undefined) addr.lat = body.lat;
  if (body.lng !== undefined) addr.lng = body.lng;
  if (body.isDefault !== undefined) addr.isDefault = body.isDefault;
  if ((req.body as { isDefault?: boolean }).isDefault) {
    user.addresses.forEach((a) => { if (a._id?.toString() !== req.params.id) a.isDefault = false; });
  }
  await user.save();
  res.json(ok(user.addresses, 'Manzil yangilandi'));
});

/** DELETE /api/users/me/addresses/:id — manzilni o'chirish. */
export const deleteAddress = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(uid(req));
  if (!user) throw ApiError.notFound('Foydalanuvchi topilmadi');
  user.addresses = user.addresses.filter((a) => a._id?.toString() !== req.params.id);
  await user.save();
  res.json(ok(user.addresses, 'Manzil o‘chirildi'));
});

/** POST /api/users/me/favorites/:dishId — sevimli toggle. */
export const toggleFavorite = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(uid(req));
  if (!user) throw ApiError.notFound('Foydalanuvchi topilmadi');
  const idx = user.favorites.findIndex((f) => f.toString() === req.params.dishId);
  const favored = idx === -1;
  if (favored) user.favorites.push(req.params.dishId as never);
  else user.favorites.splice(idx, 1);
  await user.save();
  res.json(ok({ favored }, favored ? 'Sevimlilarga qo‘shildi' : 'Sevimlilardan olindi'));
});

/** GET /api/users/me/orders — mening buyurtmalarim. */
export const myOrders = asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
  const [items, total] = await Promise.all([
    Order.find({ user: uid(req) }).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Order.countDocuments({ user: uid(req) }),
  ]);
  res.json(paginated(items, page, limit, total, 'OK'));
});

/** GET /api/users/me/notifications — bildirishnomalarim. */
export const myNotifications = asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
  const [items, total] = await Promise.all([
    Notification.find({ user: uid(req) }).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Notification.countDocuments({ user: uid(req) }),
  ]);
  res.json(paginated(items, page, limit, total, 'OK'));
});

/** PATCH /api/users/me/notifications/read — hammasini o'qilgan qilish. */
export const markAllRead = asyncHandler(async (req: Request, res: Response) => {
  await Notification.updateMany({ user: uid(req), isRead: false }, { isRead: true });
  res.json(ok(null, 'Barchasi o‘qildi'));
});

/** PATCH /api/users/me/notifications/:id/read — bitta bildirishnoma. */
export const markOneRead = asyncHandler(async (req: Request, res: Response) => {
  await Notification.findOneAndUpdate({ _id: req.params.id, user: uid(req) }, { isRead: true });
  res.json(ok(null, 'O‘qildi'));
});

/** DELETE /api/users/me — hisobni o'chirish (soft). */
export const deleteAccount = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(uid(req));
  if (user) {
    user.isActive = false;
    await user.bumpTokenVersion();
  }
  res.clearCookie('refreshToken', { ...refreshCookieOptions(), maxAge: undefined });
  res.json(ok(null, 'Hisob o‘chirildi'));
});
