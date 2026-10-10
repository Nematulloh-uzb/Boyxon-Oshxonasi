import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createOrderSchema, cancelOrderSchema, reviewSchema } from '../validators/order.validator';
import * as c from '../controllers/order.controller';

export const orderRouter = Router();

orderRouter.use(requireAuth);
orderRouter.post('/', validate({ body: createOrderSchema }), c.createOrder);
orderRouter.get('/:id', c.getOrder);
orderRouter.patch('/:id/cancel', validate({ body: cancelOrderSchema }), c.cancelOrder);
orderRouter.post('/:id/review', validate({ body: reviewSchema }), c.reviewOrder);
