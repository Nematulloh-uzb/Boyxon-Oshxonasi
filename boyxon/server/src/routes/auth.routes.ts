import { Router } from 'express';
import passport from 'passport';
import { requireAuth } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { authLimiter, sensitiveLimiter, codeLimiter } from '../middlewares/rateLimit.middleware';
import {
  registerSchema,
  loginSchema,
  forgotSchema,
  resetSchema,
  resetTokenParamsSchema,
  changePasswordSchema,
  googleExchangeSchema,
  resendVerificationSchema,
  verifyCodeSchema,
  verifyEmailParamsSchema,
} from '../validators/auth.validator';
import { env, primaryClientUrl } from '../config/env';
import * as c from '../controllers/auth.controller';

export const authRouter = Router();

// Login/register — qat'iy limit (brute-force).
authRouter.post('/register', authLimiter, validate({ body: registerSchema }), c.register);
authRouter.post('/login', authLimiter, validate({ body: loginSchema }), c.login);

authRouter.post('/logout', c.logout);
authRouter.post('/logout-all', requireAuth, c.logoutAll);
authRouter.post('/refresh', c.refresh);
authRouter.get('/me', requireAuth, c.me);

// Google sozlanmagan bo'lsa — "Unknown strategy" xatosidan saqlab, frontendga xabar bilan qaytaramiz.
authRouter.get('/google', (req, res, next) => {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    return res.redirect(`${primaryClientUrl()}/auth?error=google_not_configured`);
  }
  return passport.authenticate('google', { scope: ['profile', 'email'], session: false })(req, res, next);
});

authRouter.get(
  '/google/callback',
  // Muvaffaqiyatsizlikda FRONTEND sahifasiga qaytish (backend'ning o'ziga emas).
  (req, res, next) =>
    passport.authenticate('google', {
      session: false,
      failureRedirect: `${primaryClientUrl()}/auth?error=google`,
    })(req, res, next),
  c.googleCallback,
);

// Bir martalik kodni tokenga almashtirish (access token URL'da yurmaydi).
authRouter.post('/google/exchange', sensitiveLimiter, validate({ body: googleExchangeSchema }), c.googleExchange);

// Parol bilan bog'liq amallar — qat'iy limit.
authRouter.post('/forgot-password', sensitiveLimiter, validate({ body: forgotSchema }), c.forgotPassword);
// Token kimniki ekanini ko'rsatish (parolni o'zgartirmaydi) — GET, shuning uchun brauzerda ochiladi.
// Bu endpoint faqat email'ni ko'rsatadi (o'zgartirmaydi), shuning uchun sensitive
// limitga kirmaydi — aks holda info+reset ketma-ketligi haqiqiy foydalanuvchini ham bloklardi.
authRouter.get(
  '/reset-password/:token/info',
  validate({ params: resetTokenParamsSchema }),
  c.resetPasswordInfo,
);
authRouter.post('/reset-password/:token', sensitiveLimiter, validate({ body: resetSchema, params: resetTokenParamsSchema }), c.resetPassword);
authRouter.patch('/change-password', requireAuth, validate({ body: changePasswordSchema }), c.changePassword);

// Email tasdiqlash. Qayta yuborish cheklangan (email bombardimoniga qarshi).
authRouter.post(
  '/verify-code',
  codeLimiter,
  validate({ body: verifyCodeSchema }),
  c.verifyEmailCode,
);
authRouter.post(
  '/verify-email/:token',
  validate({ params: verifyEmailParamsSchema }),
  c.verifyEmail,
);
authRouter.post(
  '/resend-verification',
  sensitiveLimiter,
  validate({ body: resendVerificationSchema }),
  c.resendVerification,
);
