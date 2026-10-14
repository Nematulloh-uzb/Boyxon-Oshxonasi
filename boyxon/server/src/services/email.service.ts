import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { logger, maskEmail } from '../utils/logger';

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
      // Ulanishlarni qayta ishlatish (pool): Gmail har safar YANGI ulanish
      // ochish juda sekin (har bir xat 2-10s). Pool bilan ulanish bir marta
      // ochiladi va keyingi xatlar undan tez ketadi. Timeout'lar esa ulanish
      // "osilib qolishining" oldini oladi — xat cheksiz kutib qolmaydi.
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 20_000,
    });
  }
  return transporter;
}

/** Xat sarlavhasidagi From: "Boyxon Oshxonasi <manzil>" ko'rinishida. */
function fromHeader(): string {
  const addr = env.SMTP_FROM_EMAIL || env.SMTP_USER;
  return `"${env.SMTP_FROM_NAME}" <${addr}>`;
}

/**
 * Barcha xatlar uchun yagona brend shablon: logotip sarlavha, tugma, ogohlantirish.
 * Foydalanuvchi "qaysi saytdan keldi" ni bir qarashda biladi.
 */
function brandShell(body: string): string {
  return `
  <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;background:#FFF8F1;border-radius:16px;overflow:hidden">
    <div style="background:linear-gradient(135deg,#E67E22,#F39C12);padding:20px 24px;text-align:center">
      <div style="color:#fff;font-size:22px;font-weight:bold">Boyxon Oshxonasi</div>
      <div style="color:rgba(255,255,255,.85);font-size:13px">Milliy taomlar — tez va issiq yetkazib berish</div>
    </div>
    <div style="padding:24px;background:#fff">${body}</div>
    <div style="padding:16px 24px;background:#FFF8F1;color:#906F6E;font-size:12px;text-align:center">
      Bu xat Boyxon Oshxonasi saytidan yuborildi. Agar siz so'ramagan bo'lsangiz, e'tiborsiz qoldiring.
    </div>
  </div>`;
}
/** Buyurtma tasdiqlash xati. SMTP sozlanmagan bo'lsa logga yozadi. */
export async function sendOrderEmail(to: string, orderNumber: string, total: number): Promise<void> {
  const t = getTransporter();
  const html = brandShell(
    `<h2 style="margin:0 0 8px">Buyurtmangiz qabul qilindi: <b>${orderNumber}</b></h2><p>Jami: <b>${total.toLocaleString('uz-UZ')} so'm</b></p>`,
  );
  if (!t) {
    logger.info({ to, orderNumber }, 'SMTP sozlanmagan — email yuborilmadi');
    return;
  }
  await t.sendMail({ from: fromHeader(), to, subject: `Buyurtma ${orderNumber} qabul qilindi — Boyxon Oshxonasi`, html });
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
    from: fromHeader(),
    to,
    subject: 'Emailingizni tasdiqlang — Boyxon Oshxonasi',
    html: brandShell(`
        <p>Hisobingizni faollashtirish uchun quyidagi tugmani bosing:</p>
        <p style="margin:24px 0;text-align:center">
          <a href="${verifyLink}" style="background:#E67E22;color:#fff;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:bold">Emailni tasdiqlash</a>
        </p>
        <p style="color:#666;font-size:13px">Havola 24 soat amal qiladi va bir marta ishlatiladi.</p>
        <p style="color:#666;font-size:13px">Agar siz ro'yxatdan o'tmagan bo'lsangiz, bu xatni e'tiborsiz qoldiring.</p>`),
  });
  return true;
}

/**
 * Parol tiklash xati — qaysi hisob uchunligi xatning o'zida yoziladi.
 * Foydalanuvchi "o'zimnikidan" kelganini emas, rasmiy "Boyxon Oshxonasi"
 * nomidan kelganini ko'radi (From sarlavhasi + brend shablon).
 */
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
    from: fromHeader(),
    to,
    subject: 'Parolni tiklash — Boyxon Oshxonasi',
    html: brandShell(`
        <p>Salom!</p>
        <p><b>${to}</b> hisobi uchun parolni tiklash so'rovi olindi. Davom etish uchun tugmani bosing — alohida tiklash oynasi ochiladi:</p>
        <p style="margin:24px 0;text-align:center">
          <a href="${resetLink}" style="background:#C8102E;color:#fff;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:bold">Parolni tiklash</a>
        </p>
        <p style="color:#666;font-size:13px">Havola 15 daqiqa amal qiladi va bir marta ishlatiladi.</p>
        <p style="color:#666;font-size:13px">Agar bu so'rovni siz yubormagan bo'lsangiz, xatni e'tiborsiz qoldiring — parolingiz o'zgarmaydi.</p>`),
  });
}
