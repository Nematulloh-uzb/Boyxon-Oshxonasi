import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import * as c from '../controllers/user.controller';

export const userRouter = Router();

userRouter.use(requireAuth);
userRouter.get('/me', c.getMe);
userRouter.patch('/me', c.updateMe);
userRouter.patch('/me/preferences', c.updatePreferences);
userRouter.patch('/me/notification-prefs', c.updateNotifPrefs);
userRouter.post('/me/addresses', c.addAddress);
userRouter.patch('/me/addresses/:id', c.updateAddress);
userRouter.delete('/me/addresses/:id', c.deleteAddress);
userRouter.post('/me/favorites/:dishId', c.toggleFavorite);
userRouter.get('/me/orders', c.myOrders);
userRouter.get('/me/notifications', c.myNotifications);
userRouter.patch('/me/notifications/read', c.markAllRead);
userRouter.patch('/me/notifications/:id/read', c.markOneRead);
userRouter.delete('/me', c.deleteAccount);
