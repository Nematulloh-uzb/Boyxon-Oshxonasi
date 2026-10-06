import type { Response } from 'express';
import { Foydalanuvchi } from '../models/User.model';
import { Manzil } from '../models/Address.model';
import type { AvtorizatsiyaSorovi } from '../middlewares/auth';

// Profil — ko'rish
export async function profilKorish(req: AvtorizatsiyaSorovi, res: Response): Promise<void> {
  const topildi = await Foydalanuvchi.findById(req.foydalanuvchi?.id);
  if (!topildi) {
    res.status(404).json({ xabar: 'Topilmadi' });
    return;
  }
  res.json({ foydalanuvchi: topildi });
}

// Profil — yangilash (ism, til, bildirishnoma)
export async function profilYangilash(req: AvtorizatsiyaSorovi, res: Response): Promise<void> {
  const { ism, til, bildirishnoma } = req.body as { ism?: string; til?: 'uz' | 'ru' | 'en'; bildirishnoma?: boolean };
  const yangilandi = await Foydalanuvchi.findByIdAndUpdate(
    req.foydalanuvchi?.id,
    { ...(ism ? { ism } : {}), ...(til ? { til } : {}), ...(typeof bildirishnoma === 'boolean' ? { bildirishnoma } : {}) },
    { new: true },
  );
  res.json({ xabar: 'Saqlandi', foydalanuvchi: yangilandi });
}

// Manzillar ro'yxati
export async function manzillarim(req: AvtorizatsiyaSorovi, res: Response): Promise<void> {
  const royxat = await Manzil.find({ foydalanuvchi: req.foydalanuvchi?.id }).sort({ asosiy: -1 }).lean();
  res.json({ manzillar: royxat });
}

// Manzil qo'shish
export async function manzilQoshish(req: AvtorizatsiyaSorovi, res: Response): Promise<void> {
  const { nom, manzil, moljal, lat, lng, asosiy } = req.body as {
    nom: string; manzil: string; moljal?: string; lat?: number; lng?: number; asosiy?: boolean;
  };
  if (asosiy) {
    await Manzil.updateMany({ foydalanuvchi: req.foydalanuvchi?.id }, { asosiy: false });
  }
  const yaratildi = await Manzil.create({ foydalanuvchi: req.foydalanuvchi?.id, nom, manzil, moljal, lat, lng, asosiy: !!asosiy });
  res.status(201).json({ xabar: 'Manzil saqlandi', manzil: yaratildi });
}
