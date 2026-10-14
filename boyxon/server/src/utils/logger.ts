import pino from 'pino';
import { env } from '../config/env';

/**
 * PII himoyasi: logga email/telefon to'liq yozilmaydi.
 * `maskEmail('aziz@example.com')` → `az***@example.com`.
 */
export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return '***';
  const head = (local ?? '').slice(0, 2);
  return `${head}***@${domain}`;
}

export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 4) return '***';
  return `***${digits.slice(-4)}`;
}

export const logger = pino({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  transport: env.NODE_ENV === 'production' ? undefined : { target: 'pino-pretty' },
});
