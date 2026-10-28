import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { isWorkersRuntime } from '../utils/runtime';
import { logger, maskEmail } from '../utils/logger';

/**
 * Email yuborish.
 *
 * - Cloudflare Workers: faqat HTTP provayder (Brevo yoki Resend). SMTP
 *   (Gmail) Workers'dan chiqmaydi — `ETIMEDOUT` bilan tugaydi.
 * - Node (Render/lokal): HTTP provayder bo'lsa — o'sha, aks holda SMTP.
 *
 * `EMAIL_PROVIDER=auto` (standart) mavjud kalitlarga qarab tanlaydi:
 *   BREVO_API_KEY → Brevo, RESEND_API_KEY → Resend, SMTP_USER/PASS → SMTP.
 */

type EmailProvider = 'brevo' | 'resend' | 'smtp' | 'none';

interface MailPayload {
  to: string;
  subject: string;
  html: string;
}

/**
 * Transporter tipi nodemailer'ning o'zidan olinadi.
 * (nodemailer 10 o'z turlarini olib keladi — `@types/nodemailer` endi kerak emas.)
 */
type Transporter = ReturnType<typeof nodemailer.createTransport>;

let transporter: Transporter | null = null;

function resolveProvider(): EmailProvider {
  const configured = env.EMAIL_PROVIDER;

  if (configured === 'none') return 'none';

  if (configured === 'brevo') {
    if (env.BREVO_API_KEY) return 'brevo';
    logger.warn('EMAIL_PROVIDER=brevo, lekin BREVO_API_KEY bo‘sh — email yuborilmaydi');
    return 'none';
  }
  if (configured === 'resend') {
    if (env.RESEND_API_KEY) return 'resend';
    logger.warn('EMAIL_PROVIDER=resend, lekin RESEND_API_KEY bo‘sh — email yuborilmaydi');
    return 'none';
  }
  if (configured === 'smtp') {
    // Workers'da SMTP umuman ishlamaydi — noto'g'ri sozlamada osilib qolmasin.
    if (isWorkersRuntime) {
      logger.warn('EMAIL_PROVIDER=smtp Cloudflare Workers’da qo‘llanmaydi — Brevo/Resend ishlating');
      return 'none';
    }
    return env.SMTP_USER && env.SMTP_PASS ? 'smtp' : 'none';
  }

  // auto
  if (env.BREVO_API_KEY) return 'brevo';
  if (env.RESEND_API_KEY) return 'resend';
  if (!isWorkersRuntime && env.SMTP_USER && env.SMTP_PASS) return 'smtp';
  return 'none';
}

function senderName(): string {
  return env.EMAIL_FROM_NAME || env.SMTP_FROM_NAME || 'Boyxon Oshxonasi';
}

/** `EMAIL_FROM` ichidan manzilni ajratadi: "Nom <a@b.uz>" yoki "a@b.uz". */
function senderEmail(): string {
  const raw = env.EMAIL_FROM.trim();
  if (raw) {
    const match = raw.match(/<([^>]+)>/);
    return (match ? match[1] : raw).trim();
  }
  return env.SMTP_FROM_EMAIL || env.SMTP_USER;
}

function fromHeader(): string {
  return `"${senderName()}" <${senderEmail()}>`;
}

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

/** Brevo transactional email API. */
async function sendViaBrevo(payload: MailPayload): Promise<void> {
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': env.BREVO_API_KEY,
      'content-type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify({
      sender: { name: senderName(), email: senderEmail() },
      to: [{ email: payload.to }],
      subject: payload.subject,
      htmlContent: payload.html,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Brevo ${res.status}: ${body.slice(0, 300)}`);
  }
}

/** Resend transactional email API. */
async function sendViaResend(payload: MailPayload): Promise<void> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${env.RESEND_API_KEY}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      from: fromHeader(),
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Resend ${res.status}: ${body.slice(0, 300)}`);
  }
}

/**
 * Yagona yuborish nuqtasi. Xato tashqariga otilmaydi — logga yoziladi va
 * `false` qaytadi (fon vazifasi butun so'rovni yiqitmasligi uchun).
 */
async function sendMail(payload: MailPayload): Promise<boolean> {
  const provider = resolveProvider();

  if (provider === 'none') {
    logger.warn(
      { to: maskEmail(payload.to), provider },
      'Email provayderi sozlanmagan — xat yuborilmadi (Brevo/Resend kalitini qo‘shing)',
    );
    return false;
  }

  if (!senderEmail()) {
    logger.error(
      { provider },
      'Yuboruvchi manzil yo‘q — EMAIL_FROM (yoki SMTP_USER) ni sozlang',
    );
    return false;
  }

  try {
    if (provider === 'smtp') {
      const t = getTransporter();
      if (!t) return false;
      await t.sendMail({
        from: fromHeader(),
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
      });
    } else if (provider === 'brevo') {
      await sendViaBrevo(payload);
    } else {
      await sendViaResend(payload);
    }
    return true;
  } catch (err) {
    logger.error({ err, to: maskEmail(payload.to), provider }, 'Email yuborilmadi');
    return false;
  }
}

/** Buyurtma tasdiqlash xati. */
export async function sendOrderEmail(to: string, orderNumber: string, total: number): Promise<void> {
  const html = brandShell(
    `<h2 style="margin:0 0 8px">Buyurtmangiz qabul qilindi: <b>${orderNumber}</b></h2><p>Jami: <b>${total.toLocaleString('uz-UZ')} so'm</b></p>`,
  );
  await sendMail({
    to,
    subject: `Buyurtma ${orderNumber} qabul qilindi — Boyxon Oshxonasi`,
    html,
  });
}

/** Email manzilni tasdiqlash xati. Yuborilmasa `false` qaytadi. */
export async function sendVerifyEmail(to: string, verifyLink: string): Promise<boolean> {
  return sendMail({
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
}

/**
 * Parol tiklash xati — qaysi hisob uchunligi xatning o'zida yoziladi.
 * Foydalanuvchi "o'zimnikidan" kelganini emas, rasmiy "Boyxon Oshxonasi"
 * nomidan kelganini ko'radi (From sarlavhasi + brend shablon).
 */
export async function sendResetEmail(to: string, resetLink: string): Promise<void> {
  await sendMail({
    to,
    subject: 'Parolni tiklash — Boyxon Oshxonasi',
    html: brandShell(`
        <p>Salom!</p>
        <p><b>${to}</b> hisobi uchun parolni tiklash so'rovi olindi. Davom etish uchun tugmani bosing — alohida tiklash oynasi ochiladi:</p>
        <p style="margin:24px 0;text-align:center">
          <a href="${resetLink}" style="background:#C8102E;color:#fff;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:bold">Parolni tiklash</a>
        </p>
        <p style="color:#666;font-size:13px">Havola 1 soat amal qiladi va bir marta ishlatiladi.</p>
        <p style="color:#666;font-size:13px">Agar bu so'rovni siz yubormagan bo'lsangiz, xatni e'tiborsiz qoldiring — parolingiz o'zgarmaydi.</p>`),
  });
}
