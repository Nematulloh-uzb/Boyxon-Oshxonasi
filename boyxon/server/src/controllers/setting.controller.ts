import type { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ok } from '../utils/ApiResponse';
import { Setting } from '../models/Setting.model';

/**
 * GET /api/settings — public holat.
 * Oshxona holati admin panelidan boshqariladi; yozuv hali yaratilmagan
 * bo'lsa, default "ochiq" qaytaramiz.
 */
export const getSettings = asyncHandler(async (_req: Request, res: Response) => {
  const settings = await Setting.findOne({ key: 'main' });
  // Holat tez o'zgaradi — brauzer keshiga tushmasin.
  res.setHeader('Cache-Control', 'no-store');
  res.json(
    ok(
      {
        kitchenOpen: settings?.kitchenOpen ?? true,
        cardNumber: settings?.cardNumber ?? '',
        cardHolder: settings?.cardHolder ?? '',
      },
      'OK',
    ),
  );
});
