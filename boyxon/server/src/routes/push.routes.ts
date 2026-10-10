import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import * as c from '../controllers/push.controller';

export const pushRouter = Router();

pushRouter.get('/vapid-public-key', c.vapidKey);
pushRouter.post('/subscribe', requireAuth, c.subscribe);
pushRouter.post('/unsubscribe', requireAuth, c.unsubscribe);
