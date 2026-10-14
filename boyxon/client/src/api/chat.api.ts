import { api } from './axios';
import type { ApiOk, ChatConversation, ChatMessage, ChatUser, Paginated } from '../types';

export const chatApi = {
  /** USER — o'z suhbatini (xabarlar bilan) oladi. */
  myConversation: () =>
    api
      .get<ApiOk<{ conversation: ChatConversation; messages: ChatMessage[] }>>('/chat/me')
      .then((r) => r.data),
  /** USER — xabar yuboradi. */
  sendUserMessage: (text: string) =>
    api.post<ApiOk<ChatMessage>>('/chat/me/messages', { text }).then((r) => r.data),

  /** ADMIN — barcha suhbatlar ro'yxati. */
  conversations: (params: { page?: number; limit?: number; search?: string } = {}) =>
    api
      .get<Paginated<ChatConversation & { user: ChatUser }>>('/chat/conversations', { params })
      .then((r) => r.data),
  /** ADMIN — bitta suhbat + xabarlari. */
  conversation: (id: string) =>
    api
      .get<ApiOk<{ conversation: ChatConversation & { user: ChatUser }; messages: ChatMessage[] }>>(
        `/chat/conversations/${id}`,
      )
      .then((r) => r.data),
  /** ADMIN — userga xabar yozadi. */
  sendAdminMessage: (id: string, text: string) =>
    api.post<ApiOk<ChatMessage>>(`/chat/conversations/${id}/messages`, { text }).then((r) => r.data),
};
