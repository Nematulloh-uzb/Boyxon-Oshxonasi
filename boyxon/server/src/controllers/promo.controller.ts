import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ok } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { Promo } from '../models/Promo.model';

/**
 * POST /api/promos/validate — kod + subtotal → chegirma summasi.
 * Body: { code, subtotal }
 */
export const validatePromo = asyncHandler(async (req: Request, res: Response) => {
  const { code, subtotal } = req.body as { code: string; subtotal: number };
  const promo = await Promo.findOne({ code: code.toUpperCase().trim() });
  if (!promo || !promo.isActive) throw ApiError.badRequest('Promo kod topilmadi');
  const now = new Date();
  if (promo.validFrom && promo.validFrom > now) throw ApiError.badRequest('Promo hali boshlanmagan');
  if (promo.validUntil && promo.validUntil < now) throw ApiError.badRequest('Promo muddati o‘tgan');
  if (subtotal < promo.minOrderAmount) {
    throw ApiError.badRequest(`Minimal summa: ${promo.minOrderAmount.toLocaleString('uz-UZ')} so'm`);
  }
  if (promo.usageLimit != null && promo.usedCount >= promo.usageLimit) {
    throw ApiError.badRequest('Promo limiti tugagan');
  }
  const raw = promo.type === 'percent' ? Math.floor((subtotal * promo.value) / 100) : promo.value;
  const capped = promo.maxDiscount && promo.maxDiscount > 0 ? Math.min(raw, promo.maxDiscount) : raw;
  const discount = Math.min(capped, subtotal);
  res.json(ok({ code: promo.code, discount, description: promo.description }, 'Promo qo‘llandi!'));
});
