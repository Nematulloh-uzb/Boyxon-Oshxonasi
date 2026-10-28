import bcrypt from 'bcryptjs';

/**
 * Parol hash'lash abstraksiyasi.
 *
 * Node/Render'da bcryptjs to'g'ridan-to'g'ri ishlaydi.
 * Cloudflare Workers'da esa bcrypt 10 ms CPU limitidan oshadi — shuning uchun
 * worker entry `setPasswordHasher()` orqali Durable Object'dagi hasher'ni
 * o'rnatadi (DO'da 30 s CPU limiti bor).
 */
export interface PasswordHasher {
  hash(password: string): Promise<string>;
  compare(password: string, hash: string): Promise<boolean>;
}

const bcryptHasher: PasswordHasher = {
  hash: (password) => bcrypt.hash(password, 12),
  compare: (password, hash) => bcrypt.compare(password, hash),
};

let current: PasswordHasher = bcryptHasher;

/** Worker entry (yoki test) tomonidan chaqiriladi. */
export function setPasswordHasher(hasher: PasswordHasher): void {
  current = hasher;
}

export function hashPassword(password: string): Promise<string> {
  return current.hash(password);
}

export function comparePassword(password: string, hash: string): Promise<boolean> {
  return current.compare(password, hash);
}
