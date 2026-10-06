import type { Request, Response } from 'express';
import { PromoKod } from '../models/PromoCode.model';

// Promo-kod tekshirish — /api/promo/validate
// BOYXON20 → 20% (maks 30 000), min savat 50 000
export async function promoTekshir(req: Request, res: Response): Promise<void> {
  const { kod, summa } = req.body as { kod: string; summa: number };
  const topildi = await PromoKod.findOne({ kod: kod.toUpperCase(), faol: true });
  if (!topildi) {
    res.status(404).json({ xabar: 'Promo-kod topilmadi' });
    return;
  }
  const hozir = new Date();
  if (hozir < topildi.boshlanish || hozir > topildi.tugash) {
    res.status(400).json({ xabar: 'Promo-kod muddati tugagan' });
    return;
  }
  if (topildi.ishlatilgan >= topildi.limit) {
    res.status(400).json({ xabar: 'Promo-kod limiti tugagan' });
    return;
  }
  if (summa < topildi.minSumma) {
    res.status(400).json({ xabar: `Minimal summa ${topildi.minSumma} som` });
    return;
  }
  let chegirma = 0;
  if (topildi.turi === 'foiz') {
    chegirma = Math.floor((summa * topildi.qiymat) / 100);
    if (topildi.maxChegirma) chegirma = Math.min(chegirma, topildi.maxChegirma);
  } else {
    chegirma = topildi.qiymat;
  }
  chegirma = Math.min(chegirma, summa);
  res.json({ kod: topildi.kod, chegirma, tavsif: topildi.tavsif });
}
