import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import pinoHttp from 'pino-http';
import { authRouter } from './routes/auth.routes';
import { catalogRouter } from './routes/catalog.routes';
import { orderRouter } from './routes/order.routes';
import { promoRouter } from './routes/promo.routes';
import { userRouter } from './routes/user.routes';
import { xatoUshlagich } from './middlewares/error';

// Express ilova — xavfsizlik + log + limit
export function appYarat() {
  const app = express();
  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: '1mb' }));
  app.use(pinoHttp());
  app.use(rateLimit({ windowMs: 60 * 1000, limit: 120 }));

  app.get('/salomatlik', (_req, res) => {
    res.json({ holat: 'yaxshi', vaqt: new Date().toISOString() });
  });

  app.use('/api/auth', authRouter);
  app.use('/api', catalogRouter);
  app.use('/api/promo', promoRouter);
  app.use('/api/orders', orderRouter);
  app.use('/api/user', userRouter);

  // 404
  app.use((_req, res) => {
    res.status(404).json({ xabar: 'Topilmadi' });
  });

  // Markaziy xato ushlagich (oxirida bo'lishi shart)
  app.use(xatoUshlagich);

  return app;
}

