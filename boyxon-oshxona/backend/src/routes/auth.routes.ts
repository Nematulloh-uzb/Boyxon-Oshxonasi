import { Router } from 'express';
import { kirish, men, otpSorash, otpTasdiqlash, parolTiklash, royxatdanOtish, tokenYangilash } from '../controllers/auth.controller';
import { himoya } from '../middlewares/auth';
import { tekshir } from '../middlewares/validate';
import { asyncHandler } from '../middlewares/asyncHandler';
import { kirishSxema, otpSorashSxema, otpTasdiqSxema, parolTiklashSxema, royxatSxema } from '../validators';

export const authRouter = Router();

authRouter.post('/royxat', tekshir(royxatSxema), asyncHandler(royxatdanOtish));
authRouter.post('/kirish', tekshir(kirishSxema), asyncHandler(kirish));
authRouter.post('/otp-sorash', tekshir(otpSorashSxema), asyncHandler(otpSorash));
authRouter.post('/otp-tasdiq', tekshir(otpTasdiqSxema), asyncHandler(otpTasdiqlash));
authRouter.post('/parol-tiklash', tekshir(parolTiklashSxema), asyncHandler(parolTiklash));
authRouter.post('/yangilash', asyncHandler(tokenYangilash));
authRouter.get('/men', himoya, asyncHandler(men));
