/**
 * SMTP ulanishni bir martalik tekshirish: .env dagi sozlama bilan Gmail'ga
 * ulanib, test xati yuboradi. Parol/secret hech qachon to'liq chop etilmaydi.
 *
 * Ishlatish:  npx tsx src/utils/test-smtp.ts <qabul-qiluvchi-email>
 * Misol:      npx tsx src/utils/test-smtp.ts nmatullohmansurov@gmail.com
 */
import nodemailer from 'nodemailer';
import { env } from '../config/env';

async function main(): Promise<void> {
  const to = process.argv[2];
  if (!to || !to.includes('@')) {
    console.error('Ishlatish: npx tsx src/utils/test-smtp.ts <email>');
    process.exit(1);
  }
  console.log(`SMTP_HOST=${env.SMTP_HOST} SMTP_PORT=${env.SMTP_PORT}`);
  console.log(`SMTP_USER=${env.SMTP_USER ? `${env.SMTP_USER.slice(0, 3)}*** (${env.SMTP_USER.length} belgi)` : 'BUSH!'}`);
  console.log(`SMTP_PASS=${env.SMTP_PASS ? '*** (kiritilgan)' : 'BUSH!'}`);
  if (!env.SMTP_USER || !env.SMTP_PASS) {
    console.error('❌ SMTP_USER yoki SMTP_PASS bo‘sh — .env ni to‘ldiring');
    process.exit(1);
  }
  const t = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS.replace(/\s/g, '') },
  });
  try {
    await t.verify();
    console.log('✅ SMTP ulanish OK (verify)');
  } catch (e) {
    console.error('❌ SMTP verify xatosi:', (e as Error).message);
    console.error('→ App Password noto‘g‘ri yoki 2-Step Verification o‘chiq bo‘lishi mumkin');
    process.exit(1);
  }
  const from = `"${env.SMTP_FROM_NAME}" <${env.SMTP_FROM_EMAIL || env.SMTP_USER}>`;
  await t.sendMail({
    from,
    to,
    subject: 'Boyxon Oshxonasi — SMTP test',
    html: '<p>Bu <b>Boyxon Oshxonasi</b> serveridan test xati. Sozlama ishlayapti ✅</p>',
  });
  console.log(`✅ Test xati yuborildi: ${to} (Spam papkasini ham tekshiring)`);
  process.exit(0);
}

main().catch((e) => {
  console.error('❌ Xato:', (e as Error).message);
  process.exit(1);
});
