import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createOrderSchema, cancelOrderSchema, reviewSchema, orderIdParamSchema } from '../validators/order.validator';
import * as c from '../controllers/order.controller';

export const orderRouter = Router();

orderRouter.use(requireAuth);
orderRouter.post('/', validate({ body: createOrderSchema }), c.createOrder);
orderRouter.get('/:id', validate({ params: orderIdParamSchema }), c.getOrder);
orderRouter.patch(
  '/:id/cancel',
  validate({ params: orderIdParamSchema, body: cancelOrderSchema }),
  c.cancelOrder,
);
orderRouter.post(
  '/:id/review',
  validate({ params: orderIdParamSchema, body: reviewSchema }),
  c.reviewOrder,
);
