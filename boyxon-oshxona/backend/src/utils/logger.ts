import pino from 'pino';
import { env } from '../config/env';

// Logger — Pino (JSON prod'da, chiroyli dev'da)
export const logger = pino({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  transport:
    env.NODE_ENV === 'production'
      ? undefined
      : { target: 'pino-pretty', options: { colorize: true, translateTime: 'SYS:standard' } },
});
