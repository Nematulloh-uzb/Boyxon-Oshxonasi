import bcrypt from 'bcryptjs';
import { Otp } from '../models/Otp.model';
import type { OtpMaqsad } from '../models/Otp.model';

// OTP xizmati — 6 xonali kod, 5 daqiqa amal qiladi
// XATO 6 tuzatish: /api/auth/verify-otp orqali React Query bilan chaqiriladi

const KOD_MUDDATI_DAQ = 5;
const MAKS_URINISH = 5;

export function tasodifiyKod(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function otpYarat(telefon: string, maqsad: OtpMaqsad): Promise<string> {
  const kod = tasodifiyKod();
  const kodHash = await bcrypt.hash(kod, 10);
  const amalMuddati = new Date(Date.now() + KOD_MUDDATI_DAQ * 60 * 1000);
  await Otp.create({ telefon, kodHash, maqsad, urinish: 0, tasdiqlandi: false, amalMuddati });
  return kod;
}

export async function otpTekshir(
  telefon: string,
  kod: string,
  maqsad: OtpMaqsad,
): Promise<{ ok: boolean; sabab?: string }> {
  const yozuv = await Otp.findOne({ telefon, maqsad, tasdiqlandi: false })
    .sort({ yaratilgan: -1 })
    .select('+kodHash');
  if (!yozuv) return { ok: false, sabab: 'Kod topilmadi. Qayta sorang.' };
  if (yozuv.amalMuddati.getTime() < Date.now()) return { ok: false, sabab: 'Kod muddati tugagan.' };
  if (yozuv.urinish >= MAKS_URINISH) return { ok: false, sabab: 'Urinishlar tugadi. Yangi kod oling.' };
  const mos = await bcrypt.compare(kod, yozuv.kodHash);
  if (!mos) {
    yozuv.urinish += 1;
    await yozuv.save();
    return { ok: false, sabab: "Kod noto'g'ri." };
  }
  yozuv.tasdiqlandi = true;
  await yozuv.save();
  return { ok: true };
}
