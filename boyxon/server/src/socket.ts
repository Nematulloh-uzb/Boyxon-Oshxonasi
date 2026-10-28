/**
 * Real-time emitter abstraksiyasi.
 *
 * Node (Render/lokal): `setRealtimeBroadcaster` native WebSocket hub'i
 * (`realtime-node.ts`) tomonidan o'rnatiladi.
 * Cloudflare Workers: xuddi shu funksiya Durable Object hub'iga yo'naltiradi.
 * Controller'lar `getIo()?.to(room).emit(...)` ko'rinishida qoladi.
 */
type RoomEmitter = { emit: (event: string, payload?: unknown) => void };

export interface RealtimeEmitter {
  to(room: string): RoomEmitter;
  emit(event: string, payload?: unknown): void;
}

let broadcaster: ((room: string | null, event: string, payload?: unknown) => void) | null = null;

/** Node yoki Workers entry tomonidan o'rnatiladi. */
export function setRealtimeBroadcaster(
  fn: (room: string | null, event: string, payload?: unknown) => void,
): void {
  broadcaster = fn;
}

export function getIo(): RealtimeEmitter | null {
  if (!broadcaster) return null;
  return {
    to: (room: string) => ({
      emit: (event: string, payload?: unknown) => broadcaster?.(room, event, payload),
    }),
    emit: (event: string, payload?: unknown) => broadcaster?.(null, event, payload),
  };
}
