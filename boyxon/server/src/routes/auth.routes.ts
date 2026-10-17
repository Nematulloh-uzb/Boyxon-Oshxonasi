import { Router } from 'express';
import passport from 'passport';
import { requireAuth } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { authLimiter, sensitiveLimiter } from '../middlewares/rateLimit.middleware';
import {
  registerSchema,
  loginSchema,
  forgotSchema,
  resetSchema,
  resetTokenParamsSchema,
  changePasswordSchema,
  googleExchangeSchema,
  resendVerificationSchema,
  verifyEmailParamsSchema,
} from '../validators/auth.validator';
import { env, primaryClientUrl } from '../config/env';
import { parseGoogleState, sanitizeAppRedirect } from '../utils/googleRedirect';
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
  const wantsNative = (req.query.native as string | undefined) === '1';
  // Native oqimda barcha qaytishlar bitta sahifaga: boyxon://auth/callback
  // (mobil app: src/app/auth/callback.tsx). Webda avvalgidek CLIENT_URL/auth.
  const base = wantsNative ? 'boyxon://auth' : primaryClientUrl();
  const errorPath = wantsNative ? '/callback' : '/auth';
  // Ilova o'zining aniq qaytish manzilini yuborishi mumkin:
  //  - Expo Go: exp://10.0.2.2:8081/--/auth/callback (boyxon:// ni umuman ochmaydi)
  //  - APK: boyxon://auth/callback
  // Faqat ilova sxemalari qabul qilinadi (open redirect himoyasi).
  const appRedirect = wantsNative ? sanitizeAppRedirect(req.query.redirect) : null;
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    return res.redirect(`${appRedirect ?? `${base}${errorPath}`}?error=google_not_configured`);
  }
  // Native (APK) oqimi: `native=1`ni eslab qolamiz — callback'da deep-link qaytarish uchun.
  // Passport Google'ga `state` orqali uzatadi; ilova manzili ham shu yerda saqlanadi.
  const state = wantsNative
    ? appRedirect
      ? JSON.stringify({ native: '1', redirect: appRedirect })
      : 'native=1'
    : undefined;
  return passport.authenticate('google', { scope: ['profile', 'email'], session: false, state })(req, res, next);
});

authRouter.get(
  '/google/callback',
  // Muvaffaqiyatsizlikda FRONTEND sahifasiga qaytish (backend'ning o'ziga emas).
  // Native oqimda state orqali deep-link bazani tanlaymiz (dynamic redirect).
  (req, res, next) => {
    const { native, redirect } = parseGoogleState(req.query.state);
    const target = redirect ?? (native ? 'boyxon://auth/callback' : `${primaryClientUrl()}/auth`);
    return passport.authenticate('google', {
      session: false,
      failureRedirect: `${target}?error=google`,
    })(req, res, next);
  },
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
