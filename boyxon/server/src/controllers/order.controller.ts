import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ok } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { Order } from '../models/Order.model';
import { Dish } from '../models/Dish.model';
import { Promo } from '../models/Promo.model';
import { User } from '../models/User.model';
import { sendOrderEmail } from '../services/email.service';
import { notifyUser } from '../services/notify.service';
import { getIo } from '../socket';
import { Review, recalcDishRating } from '../models/Review.model';
import type { AuthRequest } from '../types/express';

/** GET /api/orders/:id — faqat o'z buyurtmasi (yoki admin). */
export const getOrder = asyncHandler(async (req: Request, res: Response) => {
  const auth = (req as AuthRequest).user!;
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email phone')
    .populate('items.dish', 'image slug');
  if (!order) throw ApiError.notFound('Buyurtma topilmadi');
  // user populate qilingan bo'lishi ham mumkin (obyekt) yoki ObjectId (string) —
  // ikkala holatda ham tekshiramiz.
  const ownerId =
    typeof order.user === 'object' && order.user !== null && '_id' in (order.user as object)
      ? String((order.user as unknown as { _id: unknown })._id)
      : String(order.user);
  if (auth.role !== 'admin' && ownerId !== auth.id) throw ApiError.forbidden();
  res.json(ok(order, 'OK'));
});

/** PATCH /api/orders/:id/cancel — mijoz o'zi bekor qiladi (pending/confirmed). */
export const cancelOrder = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as AuthRequest).user!.id;
  const order = await Order.findOne({ _id: req.params.id, user: userId });
  if (!order) throw ApiError.notFound('Buyurtma topilmadi');
  if (!['pending', 'confirmed'].includes(order.status)) {
    throw ApiError.badRequest('Bu bosqichda bekor qilib bo‘lmaydi');
  }
  order.status = 'cancelled';
  order.cancelReason = (req.body as { reason?: string }).reason;
  order.statusHistory.push({ status: 'cancelled', timestamp: new Date(), note: order.cancelReason });
  await order.save();
  getIo()?.to('admin').emit('order:updated', { orderId: order.id, status: 'cancelled' });
  res.json(ok(order, 'Buyurtma bekor qilindi'));
});

/** POST /api/orders/:id/review — yetkazilgan buyurtmaga baho (auth). */
export const reviewOrder = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as AuthRequest).user!.id;
  const order = await Order.findOne({ _id: req.params.id, user: userId });
  if (!order) throw ApiError.notFound('Buyurtma topilmadi');
  if (order.status !== 'delivered') throw ApiError.badRequest('Faqat yetkazilganda baho beriladi');
  const { reviews } = req.body as { reviews: { dish: string; rating: number; comment?: string }[] };

  // Faqat shu buyurtmadagi taomlarga baho berilishi kerak — aks holda istalgan
  // dish ga yolg'on baho yozish mumkin edi.
  const orderDishIds = new Set(order.items.map((i) => i.dish.toString()));
  const invalid = reviews.filter((r) => !orderDishIds.has(r.dish));
  if (invalid.length) throw ApiError.badRequest('Bu taom buyurtmada yo‘q');

  const created = await Review.insertMany(
    reviews.map((r) => ({ user: userId, dish: r.dish, order: order._id, rating: r.rating, comment: r.comment })),
  );

  // insertMany post('save') hook'ini ishga tushirmaydi — reytingni qo'lda yangilaymiz.
  const dishIds = [...new Set(reviews.map((r) => r.dish))];
  await Promise.all(dishIds.map((id) => recalcDishRating(id)));

  res.status(201).json(ok(created, 'Rahmat! Bahoyingiz saqlandi'));
});


const FREE_DELIVERY_FROM = 150000;
const DELIVERY_FEE = 12000;

function calcDiscount(type: 'percent' | 'fixed', value: number, subtotal: number, max?: number): number {
  const raw = type === 'percent' ? Math.floor((subtotal * value) / 100) : value;
  const capped = max && max > 0 ? Math.min(raw, max) : raw;
  return Math.min(capped, subtotal);
}

type CreateBody = {
  items: { dish: string; quantity: number; customizations?: string }[];
  deliveryType: 'delivery' | 'pickup';
  address?: { label?: string; address?: string; lat?: number; lng?: number };
  paymentMethod: 'payme' | 'click' | 'uzum' | 'cash';
  promoCode?: string;
  notes?: string;
};

/**
 * POST /api/orders — buyurtma yaratish (auth).
 * Promo tekshiriladi, jami hisoblanadi, email + notification + socket yuboriladi.
 */
export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req as AuthRequest).user!.id;
  const { items, deliveryType, address, paymentMethod, promoCode, notes } = req.body as CreateBody;

  const dishIds = items.map((i) => i.dish);
  const dishes = await Dish.find({ _id: { $in: dishIds }, isActive: true });
  if (dishes.length !== items.length) throw ApiError.badRequest('Ba’zi taomlar topilmadi');

  const orderItems = items.map((i) => {
    const d = dishes.find((x) => x.id === i.dish);
    if (!d) throw ApiError.badRequest('Taom topilmadi');
    return { dish: d._id, name: d.name, nameRu: d.nameRu, nameEn: d.nameEn, price: d.price, quantity: i.quantity, customizations: i.customizations };
  });
  const subtotal = orderItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const deliveryFee = deliveryType === 'pickup' ? 0 : subtotal >= FREE_DELIVERY_FROM ? 0 : DELIVERY_FEE;

  let discount = 0;
  let promoDoc: Awaited<ReturnType<typeof Promo.findOne>> = null;
  if (promoCode) {
    const code = promoCode.toUpperCase().trim();
    promoDoc = await Promo.findOne({ code });
    if (!promoDoc || !promoDoc.isActive) throw ApiError.badRequest('Promo kod noto‘g‘ri');
    const now = new Date();
    if (promoDoc.validFrom && promoDoc.validFrom > now) throw ApiError.badRequest('Promo hali boshlanmagan');
    if (promoDoc.validUntil && promoDoc.validUntil < now) throw ApiError.badRequest('Promo muddati o‘tgan');
    if (subtotal < promoDoc.minOrderAmount) throw ApiError.badRequest('Minimal summa yetmadi');
    const myCount = await Order.countDocuments({ user: userId, promoCode: promoDoc.code });
    if (myCount >= promoDoc.perUserLimit) throw ApiError.badRequest('Bu promodan foydalangansiz');
    // ATOMAR limit: usedCount++ va limit tekshiruvi BITTA operatsiyada.
    // Ikki mijoz bir vaqtda olsa ham usageLimit oshib ketmaydi —
    // Mongo faqat usedCount < usageLimit bo'lsa yangilaydi.
    if (promoDoc.usageLimit != null) {
      const claimed = await Promo.findOneAndUpdate(
        { _id: promoDoc._id, $or: [{ usageLimit: null }, { $expr: { $lt: ['$usedCount', '$usageLimit'] } }] },
        { $inc: { usedCount: 1 } },
        { new: true },
      );
      if (!claimed) throw ApiError.badRequest('Promo limiti tugagan');
      promoDoc = claimed;
    } else {
      promoDoc.usedCount += 1;
      await promoDoc.save();
    }
    discount = calcDiscount(promoDoc.type, promoDoc.value, subtotal, promoDoc.maxDiscount);
  }

  const total = subtotal + deliveryFee - discount;
  const order = await Order.create({
    user: userId,
    items: orderItems,
    subtotal,
    deliveryFee,
    discount,
    total,
    promoCode: promoDoc?.code,
    deliveryType,
    address: deliveryType === 'delivery' ? address : undefined,
    paymentMethod,
    notes,
    estimatedDeliveryAt: new Date(Date.now() + 45 * 60 * 1000),
  });

  await Dish.updateMany({ _id: { $in: dishIds } }, { $inc: { orderCount: 1 } });
  const user = await User.findById(userId);
  if (user) {
    await notifyUser({
      user: userId,
      type: 'order',
      title: 'Buyurtma qabul qilindi',
      message: `${order.orderNumber} qabul qilindi!`,
      link: `/orders/${order.id}`,
    });
    sendOrderEmail(user.email, order.orderNumber, total).catch(() => undefined);
  }
  getIo()?.to('admin').emit('order:created', { orderId: order.id, orderNumber: order.orderNumber, total });
  res.status(201).json(ok(order, 'Buyurtmangiz qabul qilindi!'));
});
