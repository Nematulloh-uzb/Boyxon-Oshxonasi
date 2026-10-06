import dotenv from 'dotenv';

// .env ni yuklash (backend papkasidan)
dotenv.config();

function talab(qiymat: string | undefined, nom: string): string {
  if (!qiymat || qiymat.trim() === '') {
    throw new Error(`.env da ${nom} topilmadi`);
  }
  return qiymat;
}

// Atrof-muhit sozlamalari — barchasi shu yerdan olinadi
export const env = {
  PORT: Number(process.env.PORT ?? 4000),
  MONGO_URI: process.env.MONGO_URI ?? 'mongodb://127.0.0.1:27017/boyxon',
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET ?? 'boyxon-access-maxfiy',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET ?? 'boyxon-refresh-maxfiy',
  JWT_ACCESS_TTL: process.env.JWT_ACCESS_TTL ?? '15m',
  JWT_REFRESH_TTL: process.env.JWT_REFRESH_TTL ?? '30d',
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME ?? '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY ?? '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET ?? '',
  ESKIZ_EMAIL: process.env.ESKIZ_EMAIL ?? '',
  ESKIZ_PASSWORD: process.env.ESKIZ_PASSWORD ?? '',
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN ?? '',
  TELEGRAM_ADMIN_CHAT_ID: process.env.TELEGRAM_ADMIN_CHAT_ID ?? '',
  CLIENT_URL: process.env.CLIENT_URL ?? 'exp://localhost:8081',
  NODE_ENV: process.env.NODE_ENV ?? 'development',
};

// Majburiy maydonlarni tekshirish uchun (prod rejimda chaqiriladi)
export function envTekshir(): void {
  if (env.NODE_ENV === 'production') {
    talab(process.env.JWT_ACCESS_SECRET, 'JWT_ACCESS_SECRET');
    talab(process.env.JWT_REFRESH_SECRET, 'JWT_REFRESH_SECRET');
    talab(process.env.MONGO_URI, 'MONGO_URI');
  }
}
