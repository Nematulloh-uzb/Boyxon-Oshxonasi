import { z } from 'zod';

export const loginValidator = z.object({
  email: z.string().email('Email noto‘g‘ri'),
  password: z.string().min(1, 'Parolni kiriting'),
});

export const registerValidator = z.object({
  name: z.string().min(2, 'Ism kamida 2 harf'),
  email: z.string().email('Email noto‘g‘ri'),
  phone: z.string().optional(),
  password: z.string().min(6, 'Parol kamida 6 belgi'),
});

export const checkoutValidator = z.object({
  deliveryType: z.enum(['delivery', 'pickup']),
  addressId: z.string().optional(),
  paymentMethod: z.enum(['payme', 'click', 'uzum', 'cash']),
  promoCode: z.string().optional(),
  notes: z.string().max(500).optional(),
});

export type LoginForm = z.infer<typeof loginValidator>;
export type RegisterForm = z.infer<typeof registerValidator>;
