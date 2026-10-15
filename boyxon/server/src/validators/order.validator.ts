import { z } from 'zod';

/** Mongo ObjectId — params uchun (CastError o'rniga toza 400). */
const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Noto‘g‘ri ID formati');

export const orderIdParamSchema = z.object({ id: objectId });

export const createOrderSchema = z
  .object({
    items: z
      .array(
        z.object({
          dish: objectId,
          quantity: z.number().int().min(1).max(20),
          customizations: z.string().trim().max(300).optional(),
        }),
      )
      .min(1, 'Savatcha bo‘sh')
      .max(50, 'Bitta buyurtmada ko‘pi bilan 50 qator')
      // Bir xil taom ikki marta kelsa — ularni birlashtirish o'rniga rad etamiz
      // (client xatosi yashirin qolmasligi uchun aniq xabar).
      .refine(
        (items) => new Set(items.map((i) => i.dish)).size === items.length,
        'Bir xil taom takrorlangan — miqdorni bittada ko‘rsating',
      ),
    deliveryType: z.enum(['delivery', 'pickup']),
    address: z
      .object({
        label: z.string().trim().max(50).optional(),
        address: z.string().trim().max(300).optional(),
        lat: z.number().min(-90).max(90).optional(),
        lng: z.number().min(-180).max(180).optional(),
      })
      .optional(),
    paymentMethod: z.enum(['payme', 'click', 'uzum', 'cash']),
    promoCode: z.string().trim().min(1).max(30).optional(),
    notes: z.string().trim().max(500).optional(),
  })
  .refine(
    (data) => {
      if (data.deliveryType === 'delivery') {
        return !!data.address?.address && data.address.address.trim().length > 0;
      }
      return true;
    },
    { message: 'Yetkazib berish uchun manzil kiritilishi shart', path: ['address'] },
  );

export const cancelOrderSchema = z.object({
  reason: z.string().max(300).optional(),
});

export const reviewSchema = z.object({
  reviews: z
    .array(
      z.object({
        dish: objectId,
        rating: z.number().min(1).max(5),
        comment: z.string().max(1000).optional(),
      }),
    )
    .min(1),
});
