import { Router } from 'express';
import { manzilQoshish, manzillarim, profilKorish, profilYangilash } from '../controllers/user.controller';
import { himoya } from '../middlewares/auth';
import { asyncHandler } from '../middlewares/asyncHandler';

export const userRouter = Router();

userRouter.use(himoya);
userRouter.get('/profil', asyncHandler(profilKorish));
userRouter.patch('/profil', asyncHandler(profilYangilash));
userRouter.get('/manzillar', asyncHandler(manzillarim));
userRouter.post('/manzillar', asyncHandler(manzilQoshish));
