import type { Response } from 'express';
import { Types } from 'mongoose';
import { Buyurtma } from '../models/Order.model';
import { Hisoblagich } from '../models/Counter.model';
import { Mahsulot } from '../models/Product.model';
import { PromoKod } from '../models/PromoCode.model';
import { buyurtmaMatni, telegramXabar } from '../services/telegram.service';
import type { AvtorizatsiyaSorovi } from '../middlewares/auth';

// Buyurtma raqami: BX-000123
async function keyingiRaqam(): Promise<string> {
  const oxirgi = await Buyurtma.findOne({ raqam: /^BX-\d+$/ }).sort({ raqam: -1 }).select('raqam').lean();
  const mavjudSoni = oxirgi ? Number(oxirgi.raqam.slice(3)) : 0;
  try {
    await Hisoblagich.updateOne(
      { _id: 'buyurtma' },
      { $max: { qiymat: mavjudSoni } },
      { upsert: true },
    );
  } catch (xato) {
    if ((xato as { code?: number }).code !== 11000) throw xato;
  }
  const hisoblagich = await Hisoblagich.findOneAndUpdate(
    { _id: 'buyurtma' },
    { $inc: { qiymat: 1 } },
    { new: true, upsert: true },
  );
  return `BX-${String(hisoblagich!.qiymat).padStart(6, '0')}`;
}

// Yaratish — hisob-kitob BACKEND'da (XATO 4 tuzatish)
export async function buyurtmaYarat(req: AvtorizatsiyaSorovi, res: Response): Promise<void> {
  const { mahsulotlar, manzil, moljal, telefon, tolovUsuli, promoKod, izoh } = req.body as {
    mahsulotlar: { mahsulot: string; soni: number }[];
    manzil: string; moljal?: string; telefon: string;
    tolovUsuli: 'naqd' | 'karta' | 'click' | 'payme';
    promoKod?: string; izoh?: string;
  };

  // Mahsulot narxlarini bazadan olamiz
  const idlar = mahsulotlar.map((m) => new Types.ObjectId(m.mahsulot));
  const bazadagilar = await Mahsulot.find({ _id: { $in: idlar }, mavjud: true });
  if (bazadagilar.length !== mahsulotlar.length) {
    res.status(400).json({ xabar: 'Ba’zi mahsulotlar topilmadi' });
    return;
  }

  let oraliqJami = 0;
  const qatorlar = mahsulotlar.map((m) => {
    const b = bazadagilar.find((x) => String(x._id) === m.mahsulot);
    if (!b) throw new Error('Mahsulot topilmadi');
    const jami = b.narx * m.soni;
    oraliqJami += jami;
    return { mahsulot: b._id, nom: b.nom, narx: b.narx, soni: m.soni, jami };
  });

  // Promo chegirma
  let chegirma = 0;
  let promo = '';
  let promoId: Types.ObjectId | undefined;
  if (promoKod) {
    const hozir = new Date();
    const topildi = await PromoKod.findOneAndUpdate(
      {
        kod: promoKod.toUpperCase(),
        faol: true,
        boshlanish: { $lte: hozir },
        tugash: { $gte: hozir },
        minSumma: { $lte: oraliqJami },
        $expr: { $lt: ['$ishlatilgan', '$limit'] },
      },
      { $inc: { ishlatilgan: 1 } },
      { new: true },
    );

    if (!topildi) {
      res.status(400).json({ xabar: 'Promo-kod yaroqsiz, muddati tugagan yoki limiti yakunlangan' });
      return;
    }

    if (topildi.turi === 'foiz') {
      chegirma = Math.floor((oraliqJami * topildi.qiymat) / 100);
      if (topildi.maxChegirma) chegirma = Math.min(chegirma, topildi.maxChegirma);
    } else {
      chegirma = topildi.qiymat;
    }
    chegirma = Math.min(chegirma, oraliqJami);
    promo = topildi.kod;
    promoId = topildi._id;
  }

  const yetkazishNarxi = oraliqJami >= 200000 ? 0 : 14000;
  const jami = oraliqJami + yetkazishNarxi - chegirma;
  let raqam: string;
  try {
    raqam = await keyingiRaqam();
    const yaratildi = await Buyurtma.create({
      raqam,
      mijoz: req.foydalanuvchi?.id,
      mahsulotlar: qatorlar,
      oraliqJami,
      yetkazishNarxi,
      chegirma,
      jami,
      promoKod: promo || undefined,
      manzil,
      moljal,
      telefon,
      tolovUsuli,
      holat: 'yangi',
      izoh,
    });

    res.status(201).json({ xabar: 'Buyurtma qabul qilindi', buyurtma: yaratildi });
  } catch (xato) {
    if (promoId) {
      try {
        await PromoKod.updateOne({ _id: promoId }, { $inc: { ishlatilgan: -1 } });
      } catch {
        console.error('Buyurtma saqlanmadi, promo-kod limiti qaytarilmadi.');
      }
    }
    throw xato;
  }

  void telegramXabar(buyurtmaMatni(raqam, jami, manzil, telefon)).catch(() => {
    console.error('Buyurtma xabari Telegramga yuborilmadi.');
  });
}

// Mening buyurtmalarim
export async function meningBuyurtmalarim(req: AvtorizatsiyaSorovi, res: Response): Promise<void> {
  const royxat = await Buyurtma.find({ mijoz: req.foydalanuvchi?.id }).sort({ yaratilgan: -1 }).lean();
  res.json({ buyurtmalar: royxat });
}

// Bitta buyurtma
export async function buyurtmaBittasi(req: AvtorizatsiyaSorovi, res: Response): Promise<void> {
  const topildi = await Buyurtma.findOne({ _id: req.params.id, mijoz: req.foydalanuvchi?.id }).lean();
  if (!topildi) {
    res.status(404).json({ xabar: 'Buyurtma topilmadi' });
    return;
  }
  res.json({ buyurtma: topildi });
}
