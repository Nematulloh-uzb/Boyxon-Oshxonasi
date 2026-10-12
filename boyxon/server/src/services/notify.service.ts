import { Notification, type NotificationDoc } from '../models/Notification.model';
import { getIo } from '../socket';

export type NewNotification = {
  user: string;
  type: NotificationDoc['type'];
  title: string;
  message: string;
  link?: string;
  icon?: string;
};

/** Socket orqali yuborish uchun minimal shakl (insertMany ham to'g'ri keladi). */
export type EmitableNotification = {
  user: string | { toString(): string };
  type: string;
  title: string;
  message: string;
  link?: string;
};

/** Tayyor bildirishnomani foydalanuvchiga real-time yuboradi (socket xona: user:<id>). */
export function emitNotification(n: EmitableNotification): void {
  getIo()?.to(`user:${n.user}`).emit('notification:new', {
    type: n.type,
    title: n.title,
    message: n.message,
    link: n.link,
  });
}

/** Bildirishnomani DB ga yozadi + shu zahoti real-time yuboradi. */
export async function notifyUser(data: NewNotification): Promise<NotificationDoc> {
  const n = await Notification.create(data);
  emitNotification(n);
  return n;
}
