import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { requireAdmin } from '../middlewares/admin.middleware';
import * as c from '../controllers/chat.controller';

export const chatRouter = Router();

// ── USER (o'z suhbati) ──
chatRouter.use(requireAuth);
chatRouter.get('/me', c.getMyConversation);
chatRouter.post('/me/messages', c.sendUserMessage);

// ── ADMIN (barcha suhbatlar) ──
chatRouter.use(requireAdmin);
chatRouter.get('/conversations', c.adminListConversations);
chatRouter.get('/conversations/:id', c.adminGetConversation);
chatRouter.post('/conversations/:id/messages', c.adminSendMessage);
