import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { Foydalanuvchi } from '../models/User.model';
import { otpSmsYubor } from '../services/sms.service';
import { otpTekshir, otpYarat } from '../services/otp.service';
import { accessTokenYarat, refreshTokenTekshir, refreshTokenYarat } from '../services/jwt.service';
import type { AvtorizatsiyaSorovi } from '../middlewares/auth';

// Ro'yxatdan o'tish: ism + telefon + parol, so'ng OTP yuboriladi
export async function royxatdanOtish(req: Request, res: Response): Promise<void> {
  const { ism, telefon, parol } = req.body as { ism: string; telefon: string; parol: string };
  let foydalanuvchi = await Foydalanuvchi.findOne({ telefon }).select('+parolHash');
  if (foydalanuvchi?.telefonTasdiqlangan) {
    res.status(409).json({ xabar: 'Bu telefon bilan ro‘yxatdan o‘tilgan' });
    return;
  }
  const parolHash = await bcrypt.hash(parol, 10);
  if (foydalanuvchi) {
    foydalanuvchi.ism = ism;
    foydalanuvchi.parolHash = parolHash;
    await foydalanuvchi.save();
  } else {
    foydalanuvchi = await Foydalanuvchi.create({
      ism,
      telefon,
      telefonTasdiqlangan: false,
      parolHash,
      rol: 'mijoz',
    });
  }
  const kod = await otpYarat(telefon, 'royxat');
  await otpSmsYubor(telefon, kod);
  res.status(201).json({ xabar: 'Tasdiqlash kodi yuborildi', foydalanuvchiId: String(foydalanuvchi._id) });
}

// Kirish: telefon + parol → access + refresh
export async function kirish(req: Request, res: Response): Promise<void> {
  const { telefon, parol } = req.body as { telefon: string; parol: string };
  const topildi = await Foydalanuvchi.findOne({ telefon }).select('+parolHash');
  if (!topildi) {
    res.status(401).json({ xabar: 'Telefon yoki parol xato' });
    return;
  }
  if (!topildi.telefonTasdiqlangan) {
    res.status(403).json({ xabar: 'Avval telefon raqamingizni tasdiqlang' });
    return;
  }
  const mos = await bcrypt.compare(parol, topildi.parolHash);
  if (!mos) {
    res.status(401).json({ xabar: 'Telefon yoki parol xato' });
    return;
  }
  const yuk = { sub: String(topildi._id), telefon: topildi.telefon, rol: topildi.rol };
  res.json({
    xabar: 'Xush kelibsiz!',
    accessToken: accessTokenYarat(yuk),
    refreshToken: refreshTokenYarat(yuk),
    foydalanuvchi: { id: String(topildi._id), ism: topildi.ism, telefon: topildi.telefon, rol: topildi.rol },
  });
}

// OTP so'rash: tiklash / kirish / ro'yxat uchun
export async function otpSorash(req: Request, res: Response): Promise<void> {
  const { telefon, maqsad } = req.body as { telefon: string; maqsad: 'royxat' | 'tiklash' | 'kirish' };
  const kod = await otpYarat(telefon, maqsad);
  await otpSmsYubor(telefon, kod);
  res.json({ xabar: 'Tasdiqlash kodi yuborildi' });
}

// OTP tasdiqlash → token berish
export async function otpTasdiqlash(req: Request, res: Response): Promise<void> {
  const { telefon, kod, maqsad } = req.body as { telefon: string; kod: string; maqsad: 'royxat' | 'tiklash' | 'kirish' };
  const natija = await otpTekshir(telefon, kod, maqsad);
  if (!natija.ok) {
    res.status(400).json({ xabar: natija.sabab ?? "Kod noto'g'ri" });
    return;
  }
  let foydalanuvchi = await Foydalanuvchi.findOne({ telefon });
  if (!foydalanuvchi && maqsad === 'royxat') {
    res.status(404).json({ xabar: 'Avval royxatdan oting' });
    return;
  }
  if (!foydalanuvchi) {
    res.status(404).json({ xabar: 'Foydalanuvchi topilmadi' });
    return;
  }
  if (maqsad === 'royxat') {
    foydalanuvchi.telefonTasdiqlangan = true;
    await foydalanuvchi.save();
  }
  const yuk = { sub: String(foydalanuvchi._id), telefon: foydalanuvchi.telefon, rol: foydalanuvchi.rol };
  res.json({
    xabar: 'Tasdiqlandi',
    accessToken: accessTokenYarat(yuk),
    refreshToken: refreshTokenYarat(yuk),
  });
}

// Parolni tiklash: OTP + yangi parol
export async function parolTiklash(req: Request, res: Response): Promise<void> {
  const { telefon, kod, yangiParol } = req.body as { telefon: string; kod: string; yangiParol: string };
  const natija = await otpTekshir(telefon, kod, 'tiklash');
  if (!natija.ok) {
    res.status(400).json({ xabar: natija.sabab ?? "Kod noto'g'ri" });
    return;
  }
  const parolHash = await bcrypt.hash(yangiParol, 10);
  await Foydalanuvchi.updateOne({ telefon }, { parolHash });
  res.json({ xabar: 'Parol yangilandi' });
}

// Token yangilash
export async function tokenYangilash(req: Request, res: Response): Promise<void> {
  const { refreshToken } = req.body as { refreshToken: string };
  if (!refreshToken) {
    res.status(401).json({ xabar: 'Refresh token kerak' });
    return;
  }
  try {
    const yuk = refreshTokenTekshir(refreshToken);
    const yangi = { sub: yuk.sub, telefon: yuk.telefon, rol: yuk.rol };
    res.json({ accessToken: accessTokenYarat(yangi), refreshToken: refreshTokenYarat(yangi) });
  } catch {
    res.status(401).json({ xabar: 'Refresh token yaroqsiz' });
  }
}

// Men — himoyalangan
export async function men(req: AvtorizatsiyaSorovi, res: Response): Promise<void> {
  const topildi = await Foydalanuvchi.findById(req.foydalanuvchi?.id);
  if (!topildi) {
    res.status(404).json({ xabar: 'Topilmadi' });
    return;
  }
  res.json({ foydalanuvchi: topildi });
}
