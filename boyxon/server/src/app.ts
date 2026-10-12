import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import { env } from './config/env';
import { initPassport } from './config/passport';
import { errorHandler } from './middlewares/error.middleware';
import { apiLimiter } from './middlewares/rateLimit.middleware';
import { authRouter } from './routes/auth.routes';
import { categoryRouter } from './routes/category.routes';
import { dishRouter } from './routes/dish.routes';
import { orderRouter } from './routes/order.routes';
import { promoRouter } from './routes/promo.routes';
import { userRouter } from './routes/user.routes';
import { notificationRouter } from './routes/notification.routes';
import { pushRouter } from './routes/push.routes';
import { adminRouter } from './routes/admin.routes';
import { chatRouter } from './routes/chat.routes';
import { chatRouter } from './routes/chat.routes';

export function createApp() {
  const app = express();
  // Railway/Vercel kabi proxy ortida real IP ni olish uchun (rate-limit to'g'ri ishlashi uchun)
  app.set('trust proxy', 1);

  app.use(helmet({ crossOriginResourcePolicy: false }));
  app.use(cors({ origin: env.CLIENT_URL.split(','), credentials: true }));
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  initPassport();
  app.use(passport.initialize());

  app.get('/health', (_req, res) => {
    res.json({ success: true, message: 'Boyxon API ishlayapti', data: { time: new Date().toISOString() } });
  });

  app.use('/api', apiLimiter);
  app.use('/api/auth', authRouter);
  app.use('/api/categories', categoryRouter);
  app.use('/api/dishes', dishRouter);
  app.use('/api/orders', orderRouter);
  app.use('/api/promos', promoRouter);
  app.use('/api/users', userRouter);
  app.use('/api/notifications', notificationRouter);
  app.use('/api/push', pushRouter);
  app.use('/api/admin', adminRouter);
  app.use('/api/chat', chatRouter);

  app.use((_req, res) => {
    res.status(404).json({ success: false, message: 'Topilmadi', data: null });
  });
  app.use(errorHandler);

  return app;
}
