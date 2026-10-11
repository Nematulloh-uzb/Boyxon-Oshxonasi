import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ok, paginated } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { Dish } from '../models/Dish.model';
import { Category } from '../models/Category.model';
import { Review } from '../models/Review.model';
import type { FilterQuery } from 'mongoose';
import type { DishDoc } from '../models/Dish.model';

/**
 * GET /api/dishes — qidiruv + filtr + pagination (public).
 * Query: category, search, minPrice, maxPrice, rating, tags, sort, page, limit
 */
export const listDishes = asyncHandler(async (req: Request, res: Response) => {
  const q = req.query as Record<string, string | undefined>;
  const page = Math.max(1, Number(q.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(q.limit) || 20));
  const filter: FilterQuery<DishDoc> = { isActive: true };

  if (q.category) {
    const cat = await Category.findOne({ slug: q.category });
    if (cat) filter.category = cat._id;
    else filter.category = '000000000000000000000000';
  }
  if (q.search) filter.$text = { $search: q.search };
  if (q.minPrice || q.maxPrice) {
    filter.price = {};
    if (q.minPrice) (filter.price as Record<string, number>).$gte = Number(q.minPrice);
    if (q.maxPrice) (filter.price as Record<string, number>).$lte = Number(q.maxPrice);
  }
  if (q.rating) filter.rating = { $gte: Number(q.rating) };
  if (q.tags) filter.tags = { $in: q.tags.split(',').map((t) => t.trim()).filter(Boolean) };

  let sort: Record<string, 1 | -1> = { createdAt: -1 };
  if (q.sort === 'price_asc') sort = { price: 1 };
  else if (q.sort === 'price_desc') sort = { price: -1 };
  else if (q.sort === 'rating') sort = { rating: -1 };
  else if (q.sort === 'popular') sort = { orderCount: -1 };

  const [items, total] = await Promise.all([
    Dish.find(filter).populate('category', 'name nameRu nameEn slug icon').sort(sort).skip((page - 1) * limit).limit(limit),
    Dish.countDocuments(filter),
  ]);
  res.json(paginated(items, page, limit, total, 'OK'));
});

/** GET /api/dishes/featured — top 8 tanlangan taomlar. */
export const featuredDishes = asyncHandler(async (_req: Request, res: Response) => {
  const items = await Dish.find({ isActive: true, isFeatured: true })
    .populate('category', 'name slug')
    .sort({ rating: -1 })
    .limit(8);
  res.json(ok(items, 'OK'));
});

/** GET /api/dishes/:slug — bitta taom + so'nggi sharhlar. */
export const getDish = asyncHandler(async (req: Request, res: Response) => {
  const dish = await Dish.findOne({
    $or: [{ slug: req.params.slug }, { _id: req.params.slug.match(/^[0-9a-fA-F]{24}$/) ? req.params.slug : '000000000000000000000000' }],
    isActive: true,
  }).populate('category', 'name slug');
  if (!dish) throw ApiError.notFound('Taom topilmadi');
  const reviews = await Review.find({ dish: dish._id })
    .populate('user', 'name avatar')
    .sort({ createdAt: -1 })
    .limit(5);
  res.json(ok({ dish, reviews }, 'OK'));
});

/** GET /api/dishes/:id/reviews — sahifalangan sharhlar. */
export const dishReviews = asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
  const [items, total] = await Promise.all([
    Review.find({ dish: req.params.id })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Review.countDocuments({ dish: req.params.id }),
  ]);
  res.json(paginated(items, page, limit, total, 'OK'));
});
