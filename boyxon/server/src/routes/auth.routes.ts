import { Router } from 'express';
import passport from 'passport';
import { requireAuth } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { authLimiter } from '../middlewares/rateLimit.middleware';
import { registerSchema, loginSchema, forgotSchema, resetSchema, changePasswordSchema } from '../validators/auth.validator';
import { env } from '../config/env';
import * as c from '../controllers/auth.controller';

export const authRouter = Router();

authRouter.post('/register', authLimiter, validate({ body: registerSchema }), c.register);
authRouter.post('/login', authLimiter, validate({ body: loginSchema }), c.login);
authRouter.post('/logout', c.logout);
authRouter.post('/refresh', c.refresh);
authRouter.get('/me', requireAuth, c.me);
// Google sozlanmagan bo'lsa — "Unknown strategy" xatosidan saqlab, frontendga xabar bilan qaytaramiz.
authRouter.get('/google', (req, res, next) => {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    return res.redirect(`${env.CLIENT_URL}/auth?error=google_not_configured`);
  }
  return passport.authenticate('google', { scope: ['profile', 'email'], session: false })(req, res, next);
});
authRouter.get(
  '/google/callback',
  // Muvaffaqiyatsizlikda FRONTEND sahifasiga qaytish (backend'ning o'ziga emas).
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${env.CLIENT_URL}/auth?error=google`,
  }),
  c.googleCallback,
);
authRouter.post('/forgot-password', authLimiter, validate({ body: forgotSchema }), c.forgotPassword);
authRouter.post('/reset-password/:token', authLimiter, validate({ body: resetSchema }), c.resetPassword);
authRouter.patch('/change-password', requireAuth, validate({ body: changePasswordSchema }), c.changePassword);
