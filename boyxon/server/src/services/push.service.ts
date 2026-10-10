import webpush from 'web-push';
import { env } from '../config/env';
import { PushSubscription } from '../models/PushSubscription.model';
import { logger } from '../utils/logger';

let configured = false;

function ensureConfigured(): boolean {
  if (configured) return true;
  if (!env.VAPID_PUBLIC_KEY || !env.VAPID_PRIVATE_KEY) return false;
  webpush.setVapidDetails(env.VAPID_EMAIL, env.VAPID_PUBLIC_KEY, env.VAPID_PRIVATE_KEY);
  configured = true;
  return true;
}

export interface PushPayload {
  title: string;
  message: string;
  url?: string;
  icon?: string;
}

/** Bitta userga push yuborish (obuna bo'lgan qurilmalarga). */
export async function sendPushToUser(userId: string, payload: PushPayload): Promise<number> {
  if (!ensureConfigured()) {
    logger.info({ userId }, 'VAPID sozlanmagan — push yuborilmadi');
    return 0;
  }
  const subs = await PushSubscription.find({ user: userId });
  let sent = 0;
  for (const s of subs) {
    try {
      await webpush.sendNotification(
        { endpoint: s.endpoint, keys: s.keys as { p256dh: string; auth: string } },
        JSON.stringify({ ...payload, icon: payload.icon ?? '/favicon.ico' }),
      );
      sent++;
    } catch (e: unknown) {
      const status = (e as { statusCode?: number }).statusCode;
      if (status === 404 || status === 410) {
        await PushSubscription.deleteOne({ _id: s._id });
      } else {
        logger.warn({ e }, 'Push yuborishda xato');
      }
    }
  }
  return sent;
}

/** Bir nechta userga push yuborish. */
export async function sendPushToUsers(userIds: string[], payload: PushPayload): Promise<number> {
  let total = 0;
  for (const id of userIds) total += await sendPushToUser(id, payload);
  return total;
}
