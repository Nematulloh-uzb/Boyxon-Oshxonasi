import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ok } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { Category } from '../models/Category.model';

/** GET /api/categories — faqat aktiv kategoriyalar (public). */
export const listCategories = asyncHandler(async (_req: Request, res: Response) => {
  const items = await Category.find({ isActive: true }).sort({ order: 1, name: 1 });
  res.json(ok(items, 'OK'));
});

/** GET /api/categories/:slug — bitta kategoriya. */
export const getCategory = asyncHandler(async (req: Request, res: Response) => {
  const item = await Category.findOne({ slug: req.params.slug, isActive: true });
  if (!item) throw ApiError.notFound('Kategoriya topilmadi');
  res.json(ok(item, 'OK'));
});
