import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';

// JWT xizmati — access + refresh token
// XATO 12 tuzatish: token expo-secure-store da saqlanadi, HTTPS orqali keladi

export interface TokenYuk {
  sub: string; // foydalanuvchi id
  telefon: string;
  rol: string;
}

export function accessTokenYarat(yuk: TokenYuk): string {
  const opts: SignOptions = { expiresIn: env.JWT_ACCESS_TTL as unknown as SignOptions['expiresIn'] };
  return jwt.sign(yuk, env.JWT_ACCESS_SECRET, opts);
}

export function refreshTokenYarat(yuk: TokenYuk): string {
  const opts: SignOptions = { expiresIn: env.JWT_REFRESH_TTL as unknown as SignOptions['expiresIn'] };
  return jwt.sign(yuk, env.JWT_REFRESH_SECRET, opts);
}

export function accessTokenTekshir(token: string): TokenYuk {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenYuk;
}

export function refreshTokenTekshir(token: string): TokenYuk {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenYuk;
}
