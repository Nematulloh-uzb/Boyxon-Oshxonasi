import { Router } from 'express';
import { promoTekshir } from '../controllers/promo.controller';
import { himoya } from '../middlewares/auth';
import { tekshir } from '../middlewares/validate';
import { promoTekshirSxema } from '../validators';
import { asyncHandler } from '../middlewares/asyncHandler';

export const promoRouter = Router();

promoRouter.post('/validate', himoya, tekshir(promoTekshirSxema), asyncHandler(promoTekshir));
