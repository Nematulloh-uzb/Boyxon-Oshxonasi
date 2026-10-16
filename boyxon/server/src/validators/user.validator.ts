import { z } from 'zod';

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Noto‘g‘ri ID formati');

const phoneSchema = z
  .string()
  .trim()
  .regex(
    /^(\+998\s?\d{2}\s?\d{3}\s?\d{2}\s?\d{2}|\+?[0-9\s()\-]{7,20})$/,
    'Telefon +998 XX XXX XX XX formatda bo‘lsin',
  );

/**
 * Avatar: tashqi URL (Cloudinary va h.k.) YOKI kichraytirilgan data-URL.
 * Client rasmni canvas orqali ~512px JPEG ga siqib yuboradi (~30-60 KB) —
 * 150 000 belgi limiti oddiy rasm uchun mo'ljallangan (body limiti 256 KB).
 * Faqat jpeg/png/webp — SVG rad etiladi (u skript saqlay oladi, XSS vektori).
 */
const AVATAR_DATA_URL = /^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/;

/** Faqat http(s) havolalar — `javascript:`, `data:` va boshqa sxemalar rad etiladi
 *  (zod'ning `string().url()` i har qanday sxemani qabul qilardi). */
const HTTP_URL = /^https?:\/\/\S+$/i;

export const updateMeSchema = z.object({
  name: z.string().trim().min(2, 'Ism kamida 2 harf').max(80).optional(),
  phone: phoneSchema.optional(),
  avatar: z
    .union([
      z.string().regex(HTTP_URL, 'Faqat http(s) havola').max(500),
      z.string().regex(AVATAR_DATA_URL, 'Rasm formati noto‘g‘ri').max(150_000, 'Rasm juda katta'),
      z.literal(''),
      z.null(),
    ])
    .optional(),
});

export const updatePreferencesSchema = z.object({
  language: z.enum(['uz', 'ru', 'en']).optional(),
  theme: z.enum(['light', 'dark']).optional(),
  fontSize: z.enum(['small', 'medium', 'large']).optional(),
});

export const updateNotifPrefsSchema = z.object({
  pushEnabled: z.boolean().optional(),
});

export const addressBodySchema = z.object({
  label: z.string().trim().min(1).max(30),
  address: z.string().trim().min(3).max(300),
  isDefault: z.boolean().optional(),
});

export const addressIdParamSchema = z.object({ id: objectId });

export const dishIdParamSchema = z.object({ dishId: objectId });

export const notificationIdParamSchema = z.object({ id: objectId });
