import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { logger } from '../utils/logger';

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
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

/** Parol tiklash xati. */
export async function sendResetEmail(to: string, resetLink: string): Promise<void> {
  const t = getTransporter();
  if (!t) {
    logger.info({ to, resetLink }, 'SMTP sozlanmagan — reset email yuborilmadi');
    return;
  }
  await t.sendMail({
    from: env.SMTP_USER,
    to,
    subject: 'Parolni tiklash — Boyxon Oshxonasi',
    html: `<p>Parolni tiklash uchun <a href="${resetLink}">shu havolani</a> bosing (15 daqiqa amal qiladi).</p>`,
  });
}
