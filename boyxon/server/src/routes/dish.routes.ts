import { Router } from 'express';
import { validate } from '../middlewares/validate.middleware';
import { dishQuerySchema } from '../validators/dish.validator';
import * as c from '../controllers/dish.controller';

export const dishRouter = Router();

dishRouter.get('/featured', c.featuredDishes);
dishRouter.get('/', validate({ query: dishQuerySchema }), c.listDishes);
dishRouter.get('/:id/reviews', c.dishReviews);
dishRouter.get('/:slug', c.getDish);
