import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import {
  updateMeSchema,
  updatePreferencesSchema,
  updateNotifPrefsSchema,
  addressBodySchema,
  addressIdParamSchema,
  dishIdParamSchema,
  notificationIdParamSchema,
} from '../validators/user.validator';
import * as c from '../controllers/user.controller';

export const userRouter = Router();

userRouter.use(requireAuth);
userRouter.get('/me', c.getMe);
userRouter.patch('/me', validate({ body: updateMeSchema }), c.updateMe);
userRouter.patch('/me/preferences', validate({ body: updatePreferencesSchema }), c.updatePreferences);
userRouter.patch('/me/notification-prefs', validate({ body: updateNotifPrefsSchema }), c.updateNotifPrefs);
userRouter.post('/me/addresses', validate({ body: addressBodySchema }), c.addAddress);
userRouter.patch('/me/addresses/:id', validate({ params: addressIdParamSchema, body: addressBodySchema.partial() }), c.updateAddress);
userRouter.delete('/me/addresses/:id', validate({ params: addressIdParamSchema }), c.deleteAddress);
userRouter.post('/me/favorites/:dishId', validate({ params: dishIdParamSchema }), c.toggleFavorite);
userRouter.get('/me/orders', c.myOrders);
userRouter.get('/me/notifications', c.myNotifications);
userRouter.patch('/me/notifications/read', c.markAllRead);
userRouter.patch('/me/notifications/:id/read', validate({ params: notificationIdParamSchema }), c.markOneRead);
userRouter.delete('/me', c.deleteAccount);
