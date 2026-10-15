import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ok, paginated } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { Conversation, type ConversationDoc } from '../models/Conversation.model';
import { Message } from '../models/Message.model';
import { User } from '../models/User.model';
import { emitChatMessage, emitConversationUpdated } from '../services/chat.service';
import type { AuthRequest } from '../types/express';

const uid = (req: Request): string => (req as AuthRequest).user!.id;

/**
 * USER — o'z suhbatini oladi (yo'q bo'lsa yaratadi). Xabarlar bilan birga.
 */
export const getMyConversation = asyncHandler(async (req: Request, res: Response) => {
  const userId = uid(req);
  let conv = await Conversation.findOne({ user: userId });
  if (!conv) conv = await Conversation.create({ user: userId });

  const messages = await Message.find({ conversation: conv._id }).sort({ createdAt: 1 }).limit(300);
  // User o'qigan zahoti o'qilmaganlarni nolga tushiramiz.
  if (conv.userUnread > 0) {
    conv.userUnread = 0;
    await conv.save();
    await Message.updateMany({ conversation: conv._id, senderRole: 'admin', readAt: null }, { readAt: new Date() });
  }

  res.json(ok({ conversation: conv, messages }, 'OK'));
});

/**
 * USER — xabar yuboradi. DB ga yozadi, suhbatni yangilaydi, adminlarga real-time yuboradi.
 */
export const sendUserMessage = asyncHandler(async (req: Request, res: Response) => {
  const userId = uid(req);
  const text = String((req.body as { text?: string }).text ?? '').trim();
  if (!text) throw ApiError.badRequest('Xabar bo‘sh bo‘lmasligi kerak');

  let conv = await Conversation.findOne({ user: userId });
  if (!conv) conv = await Conversation.create({ user: userId });

  const msg = await Message.create({ conversation: conv._id, sender: userId, senderRole: 'user', text });
  await touchConversation(conv, text, 'user');

  const user = await User.findById(userId).select('name avatar');
  const payload = { message: msg, user: user ? { _id: user._id, name: user.name, avatar: user.avatar } : undefined };
  emitChatMessage('admin', payload);
  emitConversationUpdated();

  res.status(201).json(ok(msg, 'Xabar yuborildi'));
});

function escapeRegex(raw: string): string {
  return raw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * ADMIN — barcha suhbatlar ro'yxati (foydalanuvchi bilan). Qidiruv + sahifalash.
 */
export const adminListConversations = asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 30));
  const rawSearch = String(req.query.search ?? '').trim();
  const search = escapeRegex(rawSearch);

  let match: Record<string, unknown> = {};
  if (search) {
    const matchedUsers = await User.find({
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ],
    })
      .select('_id')
      .limit(50)
      .lean();
    match = {
      $or: [
        { lastMessage: { $regex: search, $options: 'i' } },
        { user: { $in: matchedUsers.map((u) => u._id) } },
      ],
    };
  }

  const [items, total] = await Promise.all([
    Conversation.find(match)
      .sort({ lastMessageAt: -1, updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('user', 'name email avatar phone'),
    Conversation.countDocuments(match),
  ]);

  res.json(paginated(items, page, limit, total, 'OK'));
});

/**
 * ADMIN — bitta suhbat + xabarlari. O'qilganda admin o'qilmaganlari nolga tushadi.
 */
export const adminGetConversation = asyncHandler(async (req: Request, res: Response) => {
  const conv = await Conversation.findById(req.params.id).populate('user', 'name email avatar phone');
  if (!conv) throw ApiError.notFound('Suhbat topilmadi');

  const messages = await Message.find({ conversation: conv._id }).sort({ createdAt: 1 }).limit(500);
  if (conv.adminUnread > 0) {
    conv.adminUnread = 0;
    await conv.save();
    await Message.updateMany({ conversation: conv._id, senderRole: 'user', readAt: null }, { readAt: new Date() });
  }
  res.json(ok({ conversation: conv, messages }, 'OK'));
});

/**
 * ADMIN — foydalanuvchiga xabar yozadi. DB + real-time (user xonasiga).
 */
export const adminSendMessage = asyncHandler(async (req: Request, res: Response) => {
  const admin = (req as AuthRequest).user!;
  const text = String((req.body as { text?: string }).text ?? '').trim();
  if (!text) throw ApiError.badRequest('Xabar bo‘sh bo‘lmasligi kerak');

  const conv = await Conversation.findById(req.params.id);
  if (!conv) throw ApiError.notFound('Suhbat topilmadi');

  const msg = await Message.create({ conversation: conv._id, sender: admin.id, senderRole: 'admin', text });
  await touchConversation(conv, text, 'admin');

  emitChatMessage(`user:${conv.user.toString()}`, { message: msg });
  emitConversationUpdated();

  res.status(201).json(ok(msg, 'Xabar yuborildi'));
});

/** Suhbat meta'ni yangilaydi: oxirgi xabar + qarshi tomon o'qimagan soni +1. */
async function touchConversation(conv: ConversationDoc, text: string, role: 'user' | 'admin'): Promise<void> {
  conv.lastMessage = text.slice(0, 300);
  conv.lastSenderRole = role;
  conv.lastMessageAt = new Date();
  if (role === 'user') conv.adminUnread += 1;
  else conv.userUnread += 1;
  await conv.save();
}
