import type { NextFunction, Request, Response } from 'express';
import type { ZodSchema } from 'zod';

// Zod validatsiya — body / query / params uchun
export function tekshir(sxema: ZodSchema, manba: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, res: Response, next: NextFunction): void => {
    const natija = sxema.safeParse(req[manba]);
    if (!natija.success) {
      const birinchi = natija.error.issues[0];
      res.status(400).json({ xabar: birinchi?.message ?? "Ma'lumot noto'g'ri" });
      return;
    }
    req[manba] = natija.data;
    next();
  };
}
