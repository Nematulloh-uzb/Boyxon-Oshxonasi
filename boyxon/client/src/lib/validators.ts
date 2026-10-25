import { z } from 'zod';

export const loginValidator = z.object({
  email: z.string().email('Email noto‘g‘ri'),
  password: z.string().min(1, 'Parolni kiriting'),
});

export const registerValidator = z.object({
  name: z.string().min(2, 'Ism kamida 2 harf'),
  email: z.string().email('Email noto‘g‘ri'),
  phone: z.string().optional(),
  password: z.string().min(8, 'Parol kamida 8 belgi bo‘lishi kerak').refine((v) => /[a-zA-Z]/.test(v), 'Parolda kamida bitta harf bo‘lishi kerak').refine((v) => /[0-9]/.test(v), 'Parolda kamida bitta raqam bo‘lishi kerak'),
});

export const checkoutValidator = z.object({
  deliveryType: z.enum(['delivery', 'pickup']),
  addressId: z.string().optional(),
  paymentMethod: z.enum(['cash', 'card']),
  promoCode: z.string().optional(),
  notes: z.string().max(500).optional(),
});

export const forgotValidator = z.object({
  email: z.string().email('Email noto‘g‘ri'),
});

const passwordValidator = z
  .string()
  .min(8, 'Parol kamida 8 belgi bo‘lishi kerak')
  .max(100, 'Parol juda uzun')
  .refine((v) => /[a-zA-Z]/.test(v), 'Parolda kamida bitta harf bo‘lishi kerak')
  .refine((v) => /[0-9]/.test(v), 'Parolda kamida bitta raqam bo‘lishi kerak');

export const resetValidator = z
  .object({
    password: passwordValidator,
    confirm: z.string().min(1, 'Parolni tasdiqlang'),
  })
  .refine((v) => v.password === v.confirm, {
    message: 'Parollar mos kelmadi',
    path: ['confirm'],
  });

export type LoginForm = z.infer<typeof loginValidator>;
export type RegisterForm = z.infer<typeof registerValidator>;
export type ForgotForm = z.infer<typeof forgotValidator>;
export type ResetForm = z.infer<typeof resetValidator>;
