import { env } from '../config/env';

// Eskiz.uz SMS xizmati — OTP kod yuborish uchun
// Token keshda saqlanadi, tugasa qayta olinadi

let keshToken: string | null = null;
let keshMuddat = 0;

async function eskizToken(): Promise<string> {
  if (keshToken && Date.now() < keshMuddat) return keshToken;
  if (!env.ESKIZ_EMAIL || !env.ESKIZ_PASSWORD) {
    throw new Error('ESKIZ_EMAIL / ESKIZ_PASSWORD .env da yo‘q');
  }
  const javob = await fetch('https://notify.eskiz.uz/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: env.ESKIZ_EMAIL, password: env.ESKIZ_PASSWORD }),
  });
  if (!javob.ok) throw new Error('Eskiz login xatosi');
  const data = (await javob.json()) as { data?: { token?: string } };
  const token = data?.data?.token;
  if (!token) throw new Error('Eskiz token olinmadi');
  keshToken = token;
  keshMuddat = Date.now() + 23 * 60 * 60 * 1000;
  return token;
}

export async function smsYubor(telefon: string, matn: string): Promise<void> {
  // Dev rejimda konsolga chiqaramiz (haqiqiy SMS ketmaydi)
  if (env.NODE_ENV !== 'production') {
    console.log(`[SMS] ${telefon}: ${matn}`);
    return;
  }
  const token = await eskizToken();
  const toza = telefon.replace(/\s/g, '');
  const javob = await fetch('https://notify.eskiz.uz/api/message/sms/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ mobile_phone: toza.replace('+', ''), message: matn, from: '4546' }),
  });
  if (!javob.ok) throw new Error('SMS yuborilmadi');
}

export async function otpSmsYubor(telefon: string, kod: string): Promise<void> {
  await smsYubor(telefon, `Boyxon Oshxonasi: tasdiqlash kodingiz ${kod}. 5 daqiqa amal qiladi.`);
}
