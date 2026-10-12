import { z } from 'zod';

// Multipart (FormData) da bo'sh inputlar "" bo'lib keladi — ularni undefined ga aylantiramiz,
// aks holda z.coerce.number() ularni 0 ga aylantirib yuboradi yoki xato beradi.
const emptyToUndefined = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((v) => (v === '' || v === null ? undefined : v), schema.optional());

export const dishQuerySchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  rating: z.coerce.number().min(0).max(5).optional(),
  tags: z.string().optional(),
  sort: z.enum(['new', 'price_asc', 'price_desc', 'rating', 'popular']).optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  featured: z.string().optional(),
});

export const dishCreateSchema = z.object({
  name: z.string().min(2).max(120),
  nameRu: emptyToUndefined(z.string()),
  nameEn: emptyToUndefined(z.string()),
  description: z.string().min(5).max(2000),
  descriptionRu: emptyToUndefined(z.string()),
  descriptionEn: emptyToUndefined(z.string()),
  price: z.coerce.number().min(0),
  oldPrice: emptyToUndefined(z.coerce.number().min(0)),
  category: z.string().min(1),
  deliveryTime: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? 30 : v),
    z.coerce.number().min(1),
  ),
  calories: emptyToUndefined(z.coerce.number().min(0)),
  tags: emptyToUndefined(z.union([z.string(), z.array(z.string())])),
  isActive: z.enum(['true', 'false']).optional(),
  isFeatured: z.enum(['true', 'false']).optional(),
});

export const dishUpdateSchema = dishCreateSchema.partial();
