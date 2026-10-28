/**
 * Cloudflare Workers entrypoint.
 *
 * Arxitektura:
 *   - Barcha HTTP so'rovlar `ApiServer` Durable Object'ga yuboriladi. DO ichida
 *     Express ishlaydi va MongoDB ulanishi DO xotirasida saqlanadi (Workers
 *     oddiy isolate'da TCP socket'ni so'rovlar orasida qayta ishlata olmaydi).
 *   - `/ws` WebSocket upgrade `RealtimeHub` DO'ga yo'naltiriladi.
 *   - bcrypt `PasswordHasher` DO ichida bajariladi (10 ms CPU limitidan qochish).
 *
 * Modul darajasida hech qanday src/ import qilinmaydi: avval binding'lar
 * `process.env` ga ko'chiriladi, keyin hammasi dinamik yuklanadi.
 */
import { env as cfEnv } from 'cloudflare:workers';

export { ApiServer, PasswordHasher, RealtimeHub } from './durable-objects';

for (const [key, value] of Object.entries(cfEnv)) {
  if (typeof value === 'string') process.env[key] = value;
}

type ApiStub = {
  fetch(request: Request): Promise<Response>;
  verifyUser(token: string): Promise<{ id: string; role: 'user' | 'admin' } | null>;
};

type HubStub = {
  fetch(request: Request): Promise<Response>;
};

/** MongoDB klasteriga yaqinroq joylashuv (Atlas odatda Yevropada). */
const LOCATION_HINT = 'weur' as DurableObjectLocationHint;

type VersionMetadata = { id: string };

/**
 * Joriy deploy versiyasi. Wrangler `version_metadata` binding'i orqali keladi.
 * Lokal dev'da bo'lmasligi mumkin — `dev` ishlatiladi.
 */
const VERSION_ID =
  (cfEnv as unknown as { CF_VERSION_METADATA?: VersionMetadata }).CF_VERSION_METADATA?.id ?? 'dev';

function namespace(name: string): DurableObjectNamespace {
  return (cfEnv as unknown as Record<string, DurableObjectNamespace>)[name];
}

function apiStub(): ApiStub {
  const ns = namespace('API_SERVER');
  // Har deploy — yangi DO nomi. Eski DO tabiiy ravishda bo'shab ketadi.
  // RealtimeHub nomi o'zgarmaydi (aks holda ochiq WebSocket'lar uziladi).
  return ns.get(ns.idFromName(`api:${VERSION_ID}`), { locationHint: LOCATION_HINT }) as unknown as ApiStub;
}

function hubStub(): HubStub {
  const ns = namespace('REALTIME_HUB');
  return ns.get(ns.idFromName('global'), { locationHint: LOCATION_HINT }) as unknown as HubStub;
}

function errorResponse(request: Request, status: number, message: string): Response {
  const headers = new Headers({ 'content-type': 'application/json; charset=utf-8' });
  const origin = request.headers.get('Origin');
  if (origin) {
    headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Access-Control-Allow-Credentials', 'true');
    headers.set('Vary', 'Origin');
  }
  return new Response(JSON.stringify({ success: false, message, data: null }), { status, headers });
}

async function handleWebSocket(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');
  if (!token) return errorResponse(request, 401, 'Token kerak');

  const user = await apiStub().verifyUser(token);
  if (!user) return errorResponse(request, 401, 'Token yaroqsiz yoki sessiya bekor qilingan');

  const headers = new Headers(request.headers);
  headers.set('x-user-id', user.id);
  headers.set('x-user-role', user.role);

  return hubStub().fetch(new Request(request, { headers }));
}

export default {
  async fetch(request: Request): Promise<Response> {
    try {
      const url = new URL(request.url);
      if (url.pathname === '/ws') return await handleWebSocket(request);
      return await apiStub().fetch(request);
    } catch (err) {
      console.error('Worker xatosi:', err);
      return errorResponse(request, 500, 'Server xatosi');
    }
  },
};
