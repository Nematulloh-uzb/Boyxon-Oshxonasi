import type { Server } from 'socket.io';

/**
 * Real-time emitter abstraksiyasi.
 *
 * Node/Render: socket.io `Server` o'rnatiladi (`setIo`).
 * Cloudflare Workers: `setRealtimeBroadcaster` orqali Durable Object'ga
 * yo'naltiriladi. Controller'lar `getIo()?.to(...).emit(...)` ko'rinishida
 * qoladi — ikkala muhitda ham bir xil ishlaydi.
 */
type RoomEmitter = { emit: (event: string, payload?: unknown) => void };

export interface RealtimeEmitter {
  to(room: string): RoomEmitter;
  emit(event: string, payload?: unknown): void;
}

let io: Server | null = null;
let broadcaster: ((room: string | null, event: string, payload?: unknown) => void) | null = null;

export function setIo(instance: Server): void {
  io = instance;
}

/** Workers entry tomonidan o'rnatiladi. */
export function setRealtimeBroadcaster(
  fn: (room: string | null, event: string, payload?: unknown) => void,
): void {
  broadcaster = fn;
}

export function getIo(): RealtimeEmitter | null {
  if (io) return io as unknown as RealtimeEmitter;
  if (!broadcaster) return null;
  return {
    to: (room: string) => ({
      emit: (event: string, payload?: unknown) => broadcaster?.(room, event, payload),
    }),
    emit: (event: string, payload?: unknown) => broadcaster?.(null, event, payload),
  };
}
