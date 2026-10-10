import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ok, paginated } from '../utils/ApiResponse';
import { Notification } from '../models/Notification.model';
import type { AuthRequest } from '../types/express';

const uid = (req: Request): string => (req as AuthRequest).user!.id;

/** GET /api/notifications — sahifalangan ro'yxat (auth). */
export const listNotifications = asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
  const [items, total] = await Promise.all([
    Notification.find({ user: uid(req) }).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Notification.countDocuments({ user: uid(req) }),
  ]);
  res.json(paginated(items, page, limit, total, 'OK'));
});

/** GET /api/notifications/unread-count — o'qilmaganlar soni. */
export const unreadCount = asyncHandler(async (req: Request, res: Response) => {
  const count = await Notification.countDocuments({ user: uid(req), isRead: false });
  res.json(ok({ count }, 'OK'));
});

/** PATCH /api/notifications/read-all — hammasini o'qilgan qilish. */
export const readAll = asyncHandler(async (req: Request, res: Response) => {
  await Notification.updateMany({ user: uid(req), isRead: false }, { isRead: true });
  res.json(ok(null, 'Barchasi o‘qildi'));
});

/** PATCH /api/notifications/:id/read — bitta bildirishnoma. */
export const readOne = asyncHandler(async (req: Request, res: Response) => {
  await Notification.findOneAndUpdate({ _id: req.params.id, user: uid(req) }, { isRead: true });
  res.json(ok(null, 'O‘qildi'));
});

/** DELETE /api/notifications/:id — o'chirish. */
export const removeNotification = asyncHandler(async (req: Request, res: Response) => {
  await Notification.findOneAndDelete({ _id: req.params.id, user: uid(req) });
  res.json(ok(null, 'O‘chirildi'));
});
