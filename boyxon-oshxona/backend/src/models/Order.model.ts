import { Schema, model, type Document, type Types } from 'mongoose';

// Buyurtma holati — mijozga o'zbekcha ko'rsatiladi
export type BuyurtmaHolati =
  | 'yangi'
  | 'tasdiqlandi'
  | 'tayyorlanmoqda'
  | 'yolda'
  | 'yetkazildi'
  | 'bekor_qilindi';

export interface BuyurtmaMahsuloti {
  mahsulot: Types.ObjectId;
  nom: string; // tarix uchun nusxa
  narx: number; // bir dona narxi
  soni: number;
  jami: number; // narx * soni
}

export interface BuyurtmaHujjat extends Document {
  raqam: string; // "BX-000123"
  mijoz: Types.ObjectId;
  mahsulotlar: BuyurtmaMahsuloti[];
  oraliqJami: number; // 146 000
  yetkazishNarxi: number; // 14 000
  chegirma: number; // 29 200
  jami: number; // 130 800 — backend hisoblaydi (XATO 4)
  promoKod?: string;
  manzil: string;
  moljal?: string;
  telefon: string;
  tolovUsuli: 'naqd' | 'karta' | 'click' | 'payme';
  holat: BuyurtmaHolati;
  izoh?: string;
  yaratilgan: Date;
  yangilangan: Date;
}

const BuyurtmaMahsulotSxema = new Schema<BuyurtmaMahsuloti>(
  {
    mahsulot: { type: Schema.Types.ObjectId, ref: 'Mahsulot', required: true },
    nom: { type: String, required: true },
    narx: { type: Number, required: true, min: 0 },
    soni: { type: Number, required: true, min: 1, max: 50 },
    jami: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const BuyurtmaSxema = new Schema<BuyurtmaHujjat>(
  {
    raqam: { type: String, required: true, unique: true, trim: true },
    mijoz: { type: Schema.Types.ObjectId, ref: 'Foydalanuvchi', required: true },
    mahsulotlar: { type: [BuyurtmaMahsulotSxema], required: true, validate: (v: unknown[]) => v.length > 0 },
    oraliqJami: { type: Number, required: true, min: 0 },
    yetkazishNarxi: { type: Number, required: true, min: 0, default: 14000 },
    chegirma: { type: Number, required: true, min: 0, default: 0 },
    jami: { type: Number, required: true, min: 0 },
    promoKod: { type: String, trim: true, uppercase: true },
    manzil: { type: String, required: true, trim: true, maxlength: 200 },
    moljal: { type: String, trim: true, maxlength: 200 },
    telefon: {
      type: String,
      required: true,
      trim: true,
      match: [/^\+998 \d{2} \d{3} \d{2} \d{2}$/, "Telefon +998 XX XXX XX XX bo'lsin"],
    },
    tolovUsuli: { type: String, enum: ['naqd', 'karta', 'click', 'payme'], default: 'naqd' },
    holat: {
      type: String,
      enum: ['yangi', 'tasdiqlandi', 'tayyorlanmoqda', 'yolda', 'yetkazildi', 'bekor_qilindi'],
      default: 'yangi',
    },
    izoh: { type: String, trim: true, maxlength: 500 },
  },
  { timestamps: { createdAt: 'yaratilgan', updatedAt: 'yangilangan' } },
);

BuyurtmaSxema.index({ mijoz: 1, yaratilgan: -1 });
BuyurtmaSxema.index({ raqam: 1 }, { unique: true });
BuyurtmaSxema.index({ holat: 1 });

export const Buyurtma = model<BuyurtmaHujjat>('Buyurtma', BuyurtmaSxema);
