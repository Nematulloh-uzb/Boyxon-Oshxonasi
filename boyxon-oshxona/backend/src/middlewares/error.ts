import type { NextFunction, Request, Response } from 'express';

// Xatolarni ushlash — barcha route xatolari shu yerga keladi
// Javob har doim o'zbekcha: { xabar: "..." }
export function xatoUshlagich(
  xato: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const matn = xato instanceof Error ? xato.message : 'Ichki xatolik';
  // Mongoose validatsiya xatosini chiroyli qilish
  if (typeof xato === 'object' && xato !== null && 'name' in xato && (xato as { name: string }).name === 'ValidationError') {
    res.status(400).json({ xabar: "Ma'lumot noto'g'ri kiritildi" });
    return;
  }
  res.status(500).json({ xabar: matn });
}

// Async controller'larni o'rash — try/catch yozmaslik uchun
export function ushlab(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next);
  };
}
