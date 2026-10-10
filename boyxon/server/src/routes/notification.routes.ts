import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import * as c from '../controllers/notification.controller';

export const notificationRouter = Router();

notificationRouter.use(requireAuth);
notificationRouter.get('/', c.listNotifications);
notificationRouter.get('/unread-count', c.unreadCount);
notificationRouter.patch('/read-all', c.readAll);
notificationRouter.patch('/:id/read', c.readOne);
notificationRouter.delete('/:id', c.removeNotification);
