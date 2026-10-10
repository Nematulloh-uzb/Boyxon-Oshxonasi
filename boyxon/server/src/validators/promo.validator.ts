import { z } from 'zod';

export const promoCreateSchema = z.object({
  code: z.string().min(3).max(30),
  description: z.string().max(300).optional(),
  type: z.enum(['percent', 'fixed']),
  value: z.number().min(0),
  minOrderAmount: z.number().min(0).default(0),
  maxDiscount: z.number().min(0).optional(),
  usageLimit: z.number().min(1).nullable().optional(),
  perUserLimit: z.number().min(1).default(1),
  validFrom: z.string().optional(),
  validUntil: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const promoUpdateSchema = promoCreateSchema.partial();

export const promoValidateSchema = z.object({
  code: z.string().min(1),
  subtotal: z.number().min(0),
});
