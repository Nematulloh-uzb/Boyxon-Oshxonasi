import { getIo } from '../socket';

/**
 * Chat real-time yetkazish — socket hodisalari.
 * io.setIo(index.ts) bilan o'rnatiladi; yo'q bo'lsa no-op (test/rester uchun).
 */

/** Xonaga chat xabari yuboradi: 'admin' yoki `user:<id>`. */
export function emitChatMessage(room: string, payload: Record<string, unknown>): void {
  getIo()?.to(room).emit('chat:message', payload);
}

/** Barcha ulangan clientlarga (admin ro'yxati + user badge) suhbat yangilangani haqida signal. */
export function emitConversationUpdated(): void {
  getIo()?.emit('chat:conversation-updated');
}

/** "Yozyapti..." indikatori — room ga signal (userId kim yozayotgani). */
export function emitTyping(room: string, userId: string): void {
  getIo()?.to(room).emit('chat:typing', { userId });
}

