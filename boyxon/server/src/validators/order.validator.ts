import { z } from 'zod';

export const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        dish: z.string().min(1),
        quantity: z.number().min(1).max(20),
        customizations: z.string().max(300).optional(),
      }),
    )
    .min(1, 'Savatcha bo‘sh'),
  deliveryType: z.enum(['delivery', 'pickup']),
  address: z
    .object({
      label: z.string().optional(),
      address: z.string().optional(),
      lat: z.number().optional(),
      lng: z.number().optional(),
    })
    .optional(),
  paymentMethod: z.enum(['payme', 'click', 'uzum', 'cash']),
  promoCode: z.string().optional(),
  notes: z.string().max(500).optional(),
});

export const cancelOrderSchema = z.object({
  reason: z.string().max(300).optional(),
});

export const reviewSchema = z.object({
  reviews: z
    .array(
      z.object({
        dish: z.string().min(1),
        rating: z.number().min(1).max(5),
        comment: z.string().max(1000).optional(),
      }),
    )
    .min(1),
});
