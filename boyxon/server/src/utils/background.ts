/**
 * Javob yuborilgandan keyin bajariladigan ishlar (email, push).
 *
 * Node'da promise shunchaki fonda ishlaydi. Cloudflare Workers'da esa javob
 * qaytarilgach kontekst bekor qilinishi mumkin — shu sababli ApiServer DO
 * `setBackgroundTracker` orqali promiselarni yig'ib, javobdan oldin kutadi.
 */
import { logger } from './logger';

type Tracker = (promise: Promise<unknown>) => void;

let tracker: Tracker | null = null;

/** Workers entry (runtime-bindings) tomonidan o'rnatiladi. */
export function setBackgroundTracker(fn: Tracker | null): void {
  tracker = fn;
}

export function runInBackground(promise: Promise<unknown>): void {
  const safe = promise.catch((err) => {
    logger.error({ err }, 'Fon vazifasi xatosi');
  });
  if (tracker) tracker(safe);
  else void safe;
}
