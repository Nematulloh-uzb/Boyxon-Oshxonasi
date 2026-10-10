import { z } from 'zod';

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
  nameRu: z.string().optional(),
  nameEn: z.string().optional(),
  description: z.string().min(5).max(2000),
  descriptionRu: z.string().optional(),
  descriptionEn: z.string().optional(),
  price: z.coerce.number().min(0),
  oldPrice: z.coerce.number().min(0).optional(),
  category: z.string().min(1),
  deliveryTime: z.coerce.number().min(1).default(30),
  calories: z.coerce.number().min(0).optional(),
  tags: z.union([z.string(), z.array(z.string())]).optional(),
  isActive: z.enum(['true', 'false']).optional(),
  isFeatured: z.enum(['true', 'false']).optional(),
});

export const dishUpdateSchema = dishCreateSchema.partial();
