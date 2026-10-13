import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { logger } from '../utils/logger';

/**
 * Transporter tipi nodemailer'ning o'zidan olinadi.
 * (nodemailer 10 o'z turlarini olib keladi — `@types/nodemailer` endi kerak emas.)
 */
type Transporter = ReturnType<typeof nodemailer.createTransport>;

let transporter: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (!env.SMTP_USER || !env.SMTP_PASS) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    });
  }
  return transporter;
}

/** Buyurtma tasdiqlash xati. SMTP sozlanmagan bo'lsa logga yozadi. */
export async function sendOrderEmail(to: string, orderNumber: string, total: number): Promise<void> {
  const t = getTransporter();
  const html = `<h2>Boyxon Oshxonasi</h2><p>Buyurtmangiz qabul qilindi: <b>${orderNumber}</b></p><p>Jami: <b>${total.toLocaleString('uz-UZ')} so'm</b></p>`;
  if (!t) {
    logger.info({ to, orderNumber }, 'SMTP sozlanmagan — email yuborilmadi');
    return;
  }
  await t.sendMail({ from: env.SMTP_USER, to, subject: `Buyurtma ${orderNumber} qabul qilindi`, html });
}

/** Email manzilni tasdiqlash xati. */
export async function sendVerifyEmail(to: string, verifyLink: string): Promise<boolean> {
  const t = getTransporter();
  if (!t) {
    /**
     * SMTP sozlanmagan. Xavfsizlik: havola (ichida token bor) logga yozilmaydi.
     * `false` qaytaramiz — chaqiruvchi shunga qarab foydalanuvchiga aniq xabar beradi.
     */
    logger.warn({ to }, 'SMTP sozlanmagan — tasdiqlash xati yuborilmadi');
    return false;
  }
  await t.sendMail({
    from: env.SMTP_USER,
    to,
    subject: 'Emailingizni tasdiqlang — Boyxon Oshxonasi',
    html: `
      <div style="font-family:sans-serif;max-width:520px">
        <h2 style="color:#E67E22">Boyxon Oshxonasi</h2>
        <p>Hisobingizni faollashtirish uchun quyidagi tugmani bosing:</p>
        <p style="margin:24px 0">
          <a href="${verifyLink}" style="background:#E67E22;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">Emailni tasdiqlash</a>
        </p>
        <p style="color:#666;font-size:13px">Havola 24 soat amal qiladi va bir marta ishlatiladi.</p>
        <p style="color:#666;font-size:13px">Agar siz ro'yxatdan o'tmagan bo'lsangiz, bu xatni e'tiborsiz qoldiring.</p>
      </div>`,
  });
  return true;
}

/** Parol tiklash xati. */
export async function sendResetEmail(to: string, resetLink: string): Promise<void> {
  const t = getTransporter();
  if (!t) {
    /**
     * Xavfsizlik: reset havolasi (ichida bir martalik token bor) LOGGA YOZILMAYDI.
     * Ilgari to'liq havola logga tushardi — logni ko'rgan har qanday odam
     * 15 daqiqa ichida hisobni egallab olishi mumkin edi.
     */
    logger.warn({ to }, 'SMTP sozlanmagan — parol tiklash xati yuborilmadi (havola logga yozilmadi)');
    return;
  }
  await t.sendMail({
    from: env.SMTP_USER,
    to,
    subject: 'Parolni tiklash — Boyxon Oshxonasi',
    html: `<p>Parolni tiklash uchun <a href="${resetLink}">shu havolani</a> bosing (15 daqiqa amal qiladi).</p><p>Agar bu so'rovni siz yubormagan bo'lsangiz, xatni e'tiborsiz qoldiring.</p>`,
  });
}
