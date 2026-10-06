import { Router } from 'express';
import { buyurtmaBittasi, buyurtmaYarat, meningBuyurtmalarim } from '../controllers/order.controller';
import { himoya } from '../middlewares/auth';
import { tekshir } from '../middlewares/validate';
import { buyurtmaSxema } from '../validators';
import { asyncHandler } from '../middlewares/asyncHandler';

export const orderRouter = Router();

orderRouter.use(himoya);
orderRouter.post('/', tekshir(buyurtmaSxema), asyncHandler(buyurtmaYarat));
orderRouter.get('/', asyncHandler(meningBuyurtmalarim));
orderRouter.get('/:id', asyncHandler(buyurtmaBittasi));
