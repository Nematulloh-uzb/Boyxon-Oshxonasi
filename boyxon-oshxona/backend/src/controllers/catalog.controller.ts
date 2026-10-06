import type { Request, Response } from 'express';
import { Kategoriya } from '../models/Category.model';
import { Mahsulot } from '../models/Product.model';

// Kategoriyalar ro'yxati — Asosiy ekrandagi gorizontal ro'yxat (XATO 3, XATO 14)
export async function kategoriyalar(_req: Request, res: Response): Promise<void> {
  const royxat = await Kategoriya.find({ faol: true }).sort({ tartib: 1 }).lean();
  res.json({ kategoriyalar: royxat });
}

// Mahsulotlar: qidiruv + kategoriya + sahifalash
export async function mahsulotlar(req: Request, res: Response): Promise<void> {
  const { kategoriya, qidiruv, mashhur, sahifa = 1, limit = 20 } = req.query as unknown as {
    kategoriya?: string; qidiruv?: string; mashhur?: boolean; sahifa: number; limit: number;
  };
  const filtr: Record<string, unknown> = { mavjud: true };
  if (kategoriya) {
    const kat = await Kategoriya.findOne({ slug: kategoriya });
    if (kat) filtr.kategoriya = kat._id;
  }
  if (mashhur) filtr.mashhur = true;
  if (qidiruv) filtr.$text = { $search: qidiruv };
  const otkazish = (Number(sahifa) - 1) * Number(limit);
  const [jami, royxat] = await Promise.all([
    Mahsulot.countDocuments(filtr),
    Mahsulot.find(filtr).populate('kategoriya', 'nom slug').sort({ mashhur: -1, reyting: -1 }).skip(otkazish).limit(Number(limit)).lean(),
  ]);
  res.json({ jami, sahifa: Number(sahifa), limit: Number(limit), mahsulotlar: royxat });
}

// Bitta mahsulot — product/[id] ekrani uchun
export async function mahsulotBittasi(req: Request, res: Response): Promise<void> {
  const topildi = await Mahsulot.findById(req.params.id).populate('kategoriya', 'nom slug').lean();
  if (!topildi) {
    res.status(404).json({ xabar: 'Mahsulot topilmadi' });
    return;
  }
  res.json({ mahsulot: topildi });
}
