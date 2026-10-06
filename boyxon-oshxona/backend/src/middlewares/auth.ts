import type { NextFunction, Request, Response } from 'express';
import { accessTokenTekshir } from '../services/jwt.service';

// JWT himoya — Authorization: Bearer <token>
export interface AvtorizatsiyaSorovi extends Request {
  foydalanuvchi?: { id: string; telefon: string; rol: string };
}

export function himoya(req: AvtorizatsiyaSorovi, res: Response, next: NextFunction): void {
  const sarlavha = req.headers.authorization ?? '';
  const [sxema, token] = sarlavha.split(' ');
  if (sxema !== 'Bearer' || !token) {
    res.status(401).json({ xabar: 'Avtorizatsiya talab qilinadi' });
    return;
  }
  try {
    const yuk = accessTokenTekshir(token);
    req.foydalanuvchi = { id: yuk.sub, telefon: yuk.telefon, rol: yuk.rol };
    next();
  } catch {
    res.status(401).json({ xabar: 'Token yaroqsiz yoki muddati tugagan' });
  }
}
