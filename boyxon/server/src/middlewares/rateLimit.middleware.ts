import type { NextFunction, Request, Response } from 'express';

/**
 * Workers-mos rate limiter.
 *
 * `express-rate-limit` modul yuklanishida `setInterval` yaratadi — Cloudflare
 * Workers global scope'da timer'ga ruxsat bermaydi. Shu sababli oddiy,
 * timer'siz, lazy-cleanup Map ishlatamiz.
 *
 * Cheklovlar avvalgidek:
 *  - apiLimiter: 600 so'rov / 15 daqiqa
 *  - authLimiter: 10 xato urinish / 15 daqiqa (muvaffaqiyatli kirish sanalmaydi)
 *  - sensitiveLimiter: 5 so'rov / soat
 *
 * Eslatma: bu xotira ichidagi hisoblagich. Workers'da har bir isolate o'z
 * Map'iga ega (Cloudflare DDoS himoyasi bilan birga), Node'da esa bitta
 * jarayon doirasida ishlaydi.
 */
type Bucket = { count: number; resetAt: number };

type Options = {
  windowMs: number;
  limit: number;
  message: string;
  skipSuccessfulRequests?: boolean;
};

function createLimiter({ windowMs, limit, message, skipSuccessfulRequests }: Options) {
  const buckets = new Map<string, Bucket>();

  const cleanup = (now: number): void => {
    if (buckets.size < 10_000) return;
    for (const [key, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(key);
    }
  };

  return function limiter(req: Request, res: Response, next: NextFunction): void {
    if (req.method === 'OPTIONS') {
      next();
      return;
    }

    const now = Date.now();
    cleanup(now);
    const key = req.ip || req.socket?.remoteAddress || 'unknown';
    let bucket = buckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      bucket = { count: 0, resetAt: now + windowMs };
      buckets.set(key, bucket);
    }

    bucket.count += 1;
    const remaining = Math.max(0, limit - bucket.count);
    const resetSeconds = Math.max(0, Math.ceil((bucket.resetAt - now) / 1000));
    res.setHeader('RateLimit-Limit', String(limit));
    res.setHeader('RateLimit-Remaining', String(remaining));
    res.setHeader('RateLimit-Reset', String(resetSeconds));

    if (skipSuccessfulRequests) {
      res.on('finish', () => {
        if (res.statusCode < 400) bucket!.count = Math.max(0, bucket!.count - 1);
      });
    }

    if (bucket.count > limit) {
      res.setHeader('Retry-After', String(resetSeconds));
      res.status(429).json({ success: false, message, data: null });
      return;
    }

    next();
  };
}

export const apiLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 600,
  message: 'Juda ko‘p so‘rov — 15 daqiqadan keyin urinib ko‘ring',
});

export const authLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  message: 'Juda ko‘p urinish — 15 daqiqadan keyin qayta urinib ko‘ring',
});

export const sensitiveLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  message: 'Juda ko‘p urinish — bir soatdan keyin qayta urinib ko‘ring',
});
