import { Schema, model, type Document } from 'mongoose';

// Promo-kod — BOYXON20 kabi (20% chegirma)
export type ChegirmaTuri = 'foiz' | 'summa';

export interface PromoKodHujjat extends Document {
  kod: string; // "BOYXON20"
  tavsif: string; // "Birinchi buyurtmaga 20%"
  turi: ChegirmaTuri;
  qiymat: number; // foiz bo'lsa 20, summa bo'lsa 10000
  minSumma: number; // minimal savat summasi
  maxChegirma?: number; // foizdagida shift
  boshlanish: Date;
  tugash: Date;
  limit: number; // jami ishlatish limiti
  ishlatilgan: number;
  faol: boolean;
  yaratilgan: Date;
  yangilangan: Date;
}

const PromoKodSxema = new Schema<PromoKodHujjat>(
  {
    kod: { type: String, required: true, unique: true, uppercase: true, trim: true, maxlength: 20 },
    tavsif: { type: String, required: true, trim: true, maxlength: 200 },
    turi: { type: String, enum: ['foiz', 'summa'], required: true },
    qiymat: { type: Number, required: true, min: 0 },
    minSumma: { type: Number, default: 0, min: 0 },
    maxChegirma: { type: Number, min: 0 },
    boshlanish: { type: Date, required: true },
    tugash: { type: Date, required: true },
    limit: { type: Number, default: 1000, min: 1 },
    ishlatilgan: { type: Number, default: 0, min: 0 },
    faol: { type: Boolean, default: true },
  },
  { timestamps: { createdAt: 'yaratilgan', updatedAt: 'yangilangan' } },
);

PromoKodSxema.index({ kod: 1 }, { unique: true });
PromoKodSxema.index({ faol: 1, tugash: 1 });

export const PromoKod = model<PromoKodHujjat>('PromoKod', PromoKodSxema);
