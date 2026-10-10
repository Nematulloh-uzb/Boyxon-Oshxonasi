import { Router } from 'express';
import * as c from '../controllers/category.controller';

export const categoryRouter = Router();

categoryRouter.get('/', c.listCategories);
categoryRouter.get('/:slug', c.getCategory);
