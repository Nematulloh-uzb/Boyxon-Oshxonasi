import type { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { env } from '../config/env';

/** Markaziy xato ushlagich — oxirgi middleware. */
 // eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({ success: false, message: err.message, data: null });
    return;
  }
  // Multer xatolari (fayl hajmi, formati, kutilmagan maydon)
  if (err && typeof err === 'object' && 'name' in err) {
    const name = (err as { name: string }).name;
    if (name === 'MulterError') {
      const code = (err as { code?: string }).code;
      const msg =
        code === 'LIMIT_FILE_SIZE'
          ? 'Rasm hajmi 5MB dan oshmasligi kerak'
          : code === 'LIMIT_FILE_COUNT'
            ? 'Faqat bitta rasm yuklash mumkin'
            : code === 'LIMIT_UNEXPECTED_FILE'
              ? 'Kutilmagan fayl maydoni (maydon nomi: image bo‘lishi kerak)'
              : (err as Error).message || 'Fayl yuklashda xato';
      res.status(400).json({ success: false, message: msg, data: null });
      return;
    }
    // Multer fileFilter dagi oddiy Error ("Faqat rasm...")
    if (name === 'Error' && /rasm/i.test((err as Error).message)) {
      res.status(400).json({ success: false, message: (err as Error).message, data: null });
      return;
    }
    // Mongoose noto'g'ri ObjectId (masalan category)
    if (name === 'CastError') {
      const path = (err as { path?: string }).path ?? 'maydon';
      res.status(400).json({ success: false, message: `Noto‘g‘ri qiymat: ${path}`, data: null });
      return;
    }
  }
  if (err && typeof err === 'object' && 'code' in err && (err as { code: number }).code === 11000) {
    res.status(409).json({ success: false, message: 'Bu qiymat allaqachon mavjud', data: null });
    return;
  }
  if (err && typeof err === 'object' && 'name' in err && (err as { name: string }).name === 'ValidationError') {
    res.status(400).json({ success: false, message: (err as Error).message, data: null });
    return;
  }
  if (env.NODE_ENV !== 'production') console.error('❌ Server xatosi:', err);
  res.status(500).json({ success: false, message: 'Serverda kutilmagan xato', data: null });
}
