import { Router } from 'express';
import { kategoriyalar, mahsulotBittasi, mahsulotlar } from '../controllers/catalog.controller';
import { tekshir } from '../middlewares/validate';
import { katalogQuerySxema } from '../validators';
import { asyncHandler } from '../middlewares/asyncHandler';

export const catalogRouter = Router();

catalogRouter.get('/kategoriyalar', asyncHandler(kategoriyalar));
catalogRouter.get('/mahsulotlar', tekshir(katalogQuerySxema, 'query'), asyncHandler(mahsulotlar));
catalogRouter.get('/mahsulotlar/:id', asyncHandler(mahsulotBittasi));
