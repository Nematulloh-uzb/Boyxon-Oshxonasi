import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import passport from 'passport';
import { corsOrigins, env, isProd } from './config/env';
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
import { chatRouter } from './routes/chat.routes';
import { adminRouter } from './routes/admin.routes';

export function createApp() {
  const app = express();

  /**
   * Ishonchli proksi FAQAT sozlangan bo'lsa yoqiladi.
   *
   * Ilgari bu shartsiz `1` edi — bu xavfli: proksi ortida bo'lmaganda hujumchi
   * `X-Forwarded-For: <tasodifiy IP>` sarlavhasini yuborib, har bir so'rovda yangi
   * "IP" ko'rsatib rate-limit ni butunlay chetlab o'tishi mumkin edi.
   */
  if (env.TRUST_PROXY > 0) app.set('trust proxy', env.TRUST_PROXY);

  app.use(
    helmet({
      crossOriginResourcePolicy: false,
      // API javoblarida MIME-sniffing va frame-ga joylashni to'samiz.
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          defaultSrc: ["'none'"],
          frameAncestors: ["'none'"],
          baseUri: ["'none'"],
          formAction: ["'none'"],
        },
      },
      referrerPolicy: { policy: 'no-referrer' },
      hsts: isProd ? { maxAge: 31536000, includeSubDomains: true, preload: true } : false,
    }),
  );

  // CORS: faqat aniq ro'yxatdagi domenlar (CLIENT_URL + Capacitor ilova hosti).
  // `*` hech qachon ishlatilmaydi, chunki credentials: true bilan birga xavfli.
  const allowedOrigins = corsOrigins();
  app.use(
    cors({
      origin: (origin, cb) => {
        // Origin yo'q (server-to-server, curl, mobil) — ruxsat.
        if (!origin) return cb(null, true);
        if (allowedOrigins.includes(origin.replace(/\/$/, ''))) return cb(null, true);
        return cb(null, false);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      maxAge: 86400,
    }),
  );

  // Javoblarda Express versiyasini oshkor qilmaymiz.
  app.disable('x-powered-by');

  app.use(express.json({ limit: '256kb' }));
  app.use(express.urlencoded({ extended: false, limit: '256kb' }));
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
  app.use('/api/chat', chatRouter);
  app.use('/api/admin', adminRouter);

  app.use((_req, res) => {
    res.status(404).json({ success: false, message: 'Topilmadi', data: null });
  });
  app.use(errorHandler);

  return app;
}
