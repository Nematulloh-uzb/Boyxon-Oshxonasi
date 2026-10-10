import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ok } from '../utils/ApiResponse';
import { PushSubscription } from '../models/PushSubscription.model';
import { env } from '../config/env';
import type { AuthRequest } from '../types/express';

/** GET /api/push/vapid-public-key — brauzer obunasi uchun ochiq kalit. */
export const vapidKey = asyncHandler(async (_req: Request, res: Response) => {
  res.json(ok({ key: env.VAPID_PUBLIC_KEY }, 'OK'));
});

/** POST /api/push/subscribe — PushSubscription saqlash (auth). */
export const subscribe = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as AuthRequest).user!.id;
  const { endpoint, keys, userAgent } = req.body as {
    endpoint: string;
    keys: { p256dh: string; auth: string };
    userAgent?: string;
  };
  await PushSubscription.findOneAndUpdate(
    { endpoint },
    { user: userId, keys, userAgent },
    { upsert: true, new: true },
  );
  res.status(201).json(ok(null, 'Push obuna saqlandi'));
});

/** POST /api/push/unsubscribe — obunani o'chirish (auth). */
export const unsubscribe = asyncHandler(async (req: Request, res: Response) => {
  const { endpoint } = req.body as { endpoint: string };
  await PushSubscription.deleteOne({ endpoint, user: (req as AuthRequest).user!.id });
  res.json(ok(null, 'Push obuna o‘chirildi'));
});
