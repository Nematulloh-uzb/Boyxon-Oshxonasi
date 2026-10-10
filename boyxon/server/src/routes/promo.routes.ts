import { Router } from 'express';
import { validate } from '../middlewares/validate.middleware';
import { promoValidateSchema } from '../validators/promo.validator';
import * as c from '../controllers/promo.controller';

export const promoRouter = Router();

promoRouter.post('/validate', validate({ body: promoValidateSchema }), c.validatePromo);
