import type { NextFunction, Request, Response } from 'express';
import { Buffer } from 'node:buffer';
import { ApiError } from '../utils/ApiError';

/**
 * JSON body parser.
 *
 * `express.json()` (body-parser → iconv-lite → node:stream) Workers runtime'da
 * `Transform` bilan ishlamaydi. API faqat JSON qabul qiladi, shuning uchun
 * kichik, Workers-mos parser ishlatamiz. Xatti-harakati bir xil:
 *  - faqat `application/json` uchun;
 *  - 256 KB limit;
 *  - bo'sh body → `{}`.
 */
export function jsonBody(req: Request, res: Response, next: NextFunction): void {
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
    next();
    return;
  }
  const contentType = String(req.headers['content-type'] ?? '');
  if (!contentType.includes('application/json')) {
    next();
    return;
  }

  const limit = 256 * 1024;
  let size = 0;
  const chunks: Buffer[] = [];
  let finished = false;

  const fail = (status: number, message: string): void => {
    if (finished) return;
    finished = true;
    res.status(status).json({ success: false, message, data: null });
  };

  req.on('data', (chunk: Buffer) => {
    if (finished) return;
    size += chunk.length;
    if (size > limit) {
      fail(413, 'So‘rov hajmi juda katta');
      req.destroy();
      return;
    }
    chunks.push(chunk);
  });

  req.on('end', () => {
    if (finished) return;
    finished = true;
    try {
      const raw = Buffer.concat(chunks).toString('utf8');
      req.body = raw.trim() ? JSON.parse(raw) : {};
      next();
    } catch {
      next(ApiError.badRequest('JSON formati noto‘g‘ri'));
    }
  });

  req.on('error', (err) => {
    if (finished) return;
    finished = true;
    next(err);
  });
}
