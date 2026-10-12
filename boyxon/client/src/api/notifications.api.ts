import { api } from './axios';
import type { ApiOk, ChatMessage, Conversation, Paginated } from '../types';

export interface MyConversation {
  conversation: Conversation;
  messages: ChatMessage[];
}

export const chatApi = {
  // USER
  myConversation: () => api.get<ApiOk<MyConversation>>('/chat/me').then((r) => r.data),
  sendUserMessage: (text: string) =>
    api.post<ApiOk<ChatMessage>>('/chat/me/messages', { text }).then((r) => r.data),

  // ADMIN
  conversations: (params: Record<string, unknown> = {}) =>
    api.get<Paginated<Conversation>>('/chat/conversations', { params }).then((r) => r.data),
  conversation: (id: string) =>
    api.get<ApiOk<MyConversation>>(`/chat/conversations/${id}`).then((r) => r.data),
  sendAdminMessage: (id: string, text: string) =>
    api.post<ApiOk<ChatMessage>>(`/chat/conversations/${id}/messages`, { text }).then((r) => r.data),
};

