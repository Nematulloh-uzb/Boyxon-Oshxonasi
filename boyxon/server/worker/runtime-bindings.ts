/**
 * Binding adapterlari: parol hash va real-time emitter.
 *
 * Bu modul ApiServer Durable Object ichida (Express handler ishlashidan oldin)
 * o'rnatiladi. Modul darajasida src/ import qilinmaydi — `process.env` bindinglar
 * bilan to'ldirilgandan keyin dinamik yuklanadi.
 */
import { env as cfEnv } from 'cloudflare:workers';

type HasherStub = {
  hash(password: string): Promise<string>;
  compare(password: string, hash: string): Promise<boolean>;
};

type HubStub = {
  broadcast(room: string | null, event: string, payload?: unknown): Promise<void>;
};

const pending: Promise<unknown>[] = [];
let installed = false;

export async function installRuntimeBindings(): Promise<void> {
  if (installed) return;
  installed = true;

  const { setPasswordHasher } = await import('../src/services/password.service');
  const { setRealtimeBroadcaster } = await import('../src/socket');
  const { setBackgroundTracker } = await import('../src/utils/background');

  // Email/push kabi javobdan keyingi ishlar javob qaytarilishidan oldin tugasin.
  setBackgroundTracker((promise) => pending.push(promise));

  const hasherNs = (cfEnv as unknown as { PASSWORD_HASHER: DurableObjectNamespace }).PASSWORD_HASHER;
  const hubNs = (cfEnv as unknown as { REALTIME_HUB: DurableObjectNamespace }).REALTIME_HUB;

  setPasswordHasher({
    hash: (password) => (hasherNs.get(hasherNs.idFromName('global')) as unknown as HasherStub).hash(password),
    compare: (password, hash) =>
      (hasherNs.get(hasherNs.idFromName('global')) as unknown as HasherStub).compare(password, hash),
  });

  setRealtimeBroadcaster((room, event, payload) => {
    // Mongoose document'lari RPC orqali structured-clone bo'lmaydi — JSON'ga aylantiramiz.
    let safePayload: unknown = payload;
    if (payload !== undefined) {
      try {
        safePayload = JSON.parse(JSON.stringify(payload));
      } catch {
        safePayload = undefined;
      }
    }
    const promise = (hubNs.get(hubNs.idFromName('global')) as unknown as HubStub).broadcast(
      room,
      event,
      safePayload,
    );
    pending.push(
      promise.catch((err) => {
        console.error('[rt] broadcast xatosi:', err);
        throw err;
      }),
    );
  });
}

/** Express javob bergach, fon vazifalari (email, push, real-time) tugashini kutamiz. */
export async function flushRuntimeTasks(): Promise<void> {
  if (!pending.length) return;
  const batch = pending.splice(0, pending.length);
  await Promise.allSettled(batch);
}
