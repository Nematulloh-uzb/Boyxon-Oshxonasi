/**
 * Cloudflare Durable Objects.
 *
 * 1) PasswordHasher — bcrypt hisoblashni asosiy Worker'dan ajratadi.
 *    Bepul planda Worker 10 ms CPU bilan cheklangan, DO esa 30 s CPU oladi.
 *
 * 2) RealtimeHub — Socket.IO o'rnini bosuvchi WebSocket markazi.
 *    Bitta global DO barcha ulanishlarni ushlaydi; xonalar (`admin`,
 *    `user:<id>`) WebSocket tag'lari orqali yuritiladi. Hibernation API
 *    ishlatiladi — bepul planda bo'sh turgan ulanishlar CPU yemasin.
 */
import { DurableObject } from 'cloudflare:workers';
import bcrypt from 'bcryptjs';

export class PasswordHasher extends DurableObject {
  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}

export class ApiServer extends DurableObject {
  private api: Promise<(request: Request) => Promise<Response>> | null = null;

  async fetch(request: Request): Promise<Response> {
    const { connectDb } = await import('../src/config/db');
    // Ulanish DO xotirasida saqlanadi — keyingi so'rovlarda ~35 ms.
    await connectDb();

    const { installRuntimeBindings, flushRuntimeTasks } = await import('./runtime-bindings');
    await installRuntimeBindings();

    if (!this.api) {
      this.api = (await import('./express-app')).getApiHandler();
    }
    const handler = await this.api;

    try {
      return await handler(request);
    } finally {
      // Fon vazifalari (email, push, real-time) tugagach javob qaytaramiz.
      await flushRuntimeTasks();
    }
  }

  /** WebSocket upgrade oldidan JWT + hisob holatini tekshiradi. */
  async verifyUser(token: string): Promise<{ id: string; role: 'user' | 'admin' } | null> {
    const { connectDb } = await import('../src/config/db');
    await connectDb();

    const { verifyAccessToken } = await import('../src/services/token.service');
    const { User } = await import('../src/models/User.model');

    try {
      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.id).select('role isActive tokenVersion').lean();
      if (!user || !user.isActive) return null;
      if ((user.tokenVersion ?? 0) !== decoded.ver) return null;
      return { id: String(decoded.id), role: user.role === 'admin' ? 'admin' : 'user' };
    } catch {
      return null;
    }
  }
}

type ClientEvent = { event?: string; data?: unknown };

export class RealtimeHub extends DurableObject {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/broadcast') {
      const body = (await request.json()) as {
        room?: string | null;
        event: string;
        payload?: unknown;
      };
      this.broadcast(body.room ?? null, body.event, body.payload);
      return new Response('ok');
    }

    if (request.headers.get('Upgrade') !== 'websocket') {
      return new Response('Expected WebSocket upgrade', { status: 426 });
    }

    const userId = request.headers.get('x-user-id');
    const role = request.headers.get('x-user-role') === 'admin' ? 'admin' : 'user';
    if (!userId) return new Response('Unauthorized', { status: 401 });

    const pair = new WebSocketPair();
    const client = pair[0];
    const server = pair[1];

    const tags = [`user:${userId}`];
    if (role === 'admin') tags.push('admin');
    this.ctx.acceptWebSocket(server, tags);

    server.send(JSON.stringify({ event: 'connected', data: { role } }));

    return new Response(null, { status: 101, webSocket: client });
  }

  /** Client → server eventlari (hozircha faqat "yozmoqda" indikatori). */
  async webSocketMessage(ws: WebSocket, raw: string | ArrayBuffer): Promise<void> {
    let msg: ClientEvent;
    try {
      msg = JSON.parse(typeof raw === 'string' ? raw : new TextDecoder().decode(raw)) as ClientEvent;
    } catch {
      return;
    }
    if (msg.event !== 'chat:typing') return;

    const tags = this.ctx.getTags(ws);
    const isAdmin = tags.includes('admin');
    const userId = tags.find((t) => t.startsWith('user:'))?.slice(5) ?? '';

    if (isAdmin) {
      const to = (msg.data as { to?: unknown } | undefined)?.to;
      if (typeof to === 'string' && /^[0-9a-fA-F]{24}$/.test(to)) {
        this.broadcast(`user:${to}`, 'chat:typing', { role: 'admin' }, ws);
      }
    } else {
      this.broadcast('admin', 'chat:typing', { from: userId, role: 'user' }, ws);
    }
  }

  async webSocketClose(ws: WebSocket, code: number, reason: string): Promise<void> {
    try {
      ws.close(code, reason);
    } catch {
      /* allaqachon yopilgan */
    }
  }

  async webSocketError(ws: WebSocket): Promise<void> {
    try {
      ws.close(1011, 'websocket error');
    } catch {
      /* ignore */
    }
  }

  /** Xona (yoki barcha ulanishlar)ga hodisa yuboradi. */
  private broadcast(room: string | null, event: string, payload?: unknown, except?: WebSocket): void {
    const sockets = room ? this.ctx.getWebSockets(room) : this.ctx.getWebSockets();
    const frame = JSON.stringify({ event, data: payload });
    for (const ws of sockets) {
      if (ws === except) continue;
      try {
        ws.send(frame);
      } catch {
        /* uzilgan socket — hibernation o'zi tozalaydi */
      }
    }
  }
}
