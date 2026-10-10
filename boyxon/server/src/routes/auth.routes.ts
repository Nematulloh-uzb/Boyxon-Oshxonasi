import { Router } from 'express';
import passport from 'passport';
import { requireAuth } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { authLimiter } from '../middlewares/rateLimit.middleware';
import { registerSchema, loginSchema, forgotSchema, resetSchema, changePasswordSchema } from '../validators/auth.validator';
import * as c from '../controllers/auth.controller';

export const authRouter = Router();

authRouter.post('/register', authLimiter, validate({ body: registerSchema }), c.register);
authRouter.post('/login', authLimiter, validate({ body: loginSchema }), c.login);
authRouter.post('/logout', c.logout);
authRouter.post('/refresh', c.refresh);
authRouter.get('/me', requireAuth, c.me);
authRouter.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));
authRouter.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/auth?error=google' }),
  c.googleCallback,
);
authRouter.post('/forgot-password', authLimiter, validate({ body: forgotSchema }), c.forgotPassword);
authRouter.post('/reset-password/:token', authLimiter, validate({ body: resetSchema }), c.resetPassword);
authRouter.patch('/change-password', requireAuth, validate({ body: changePasswordSchema }), c.changePassword);
