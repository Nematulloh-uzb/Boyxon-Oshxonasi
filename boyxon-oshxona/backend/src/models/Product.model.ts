import { Schema, model, type Document, type Types } from 'mongoose';

// Mahsulot — /api/products dan keladi (XATO 3 tuzatish: hardcoded EMAS)
export interface MahsulotHujjat extends Document {
  nom: string; // "Boyxon To'y Oshi"
  tavsif: string;
  narx: number; // so'mda, masalan 45000
  eskiNarx?: number; // chegirma uchun
  rasmUrl: string; // Cloudinary (XATO 13)
  rasmlar: string[];
  kategoriya: Types.ObjectId;
  reyting: number; // 0..5
  sharhlarSoni: number;
  tayyorlanishVaqti: string; // "25-30 daq"
  ogirlik?: string; // "450 g"
  achchiqlik: 0 | 1 | 2 | 3;
  mashhur: boolean;
  mavjud: boolean;
  tarkib: string[];
  yaratilgan: Date;
  yangilangan: Date;
}

const MahsulotSxema = new Schema<MahsulotHujjat>(
  {
    nom: { type: String, required: true, trim: true, maxlength: 100 },
    tavsif: { type: String, required: true, trim: true, maxlength: 1000 },
    narx: { type: Number, required: true, min: 0 },
    eskiNarx: { type: Number, min: 0 },
    rasmUrl: { type: String, required: true, trim: true },
    rasmlar: { type: [String], default: [] },
    kategoriya: { type: Schema.Types.ObjectId, ref: 'Kategoriya', required: true },
    reyting: { type: Number, default: 0, min: 0, max: 5 },
    sharhlarSoni: { type: Number, default: 0, min: 0 },
    tayyorlanishVaqti: { type: String, default: '25-30 daq', trim: true },
    ogirlik: { type: String, trim: true },
    achchiqlik: { type: Number, enum: [0, 1, 2, 3], default: 0 },
    mashhur: { type: Boolean, default: false },
    mavjud: { type: Boolean, default: true },
    tarkib: { type: [String], default: [] },
  },
  { timestamps: { createdAt: 'yaratilgan', updatedAt: 'yangilangan' } },
);

MahsulotSxema.index({ kategoriya: 1, mavjud: 1 });
MahsulotSxema.index({ mashhur: 1, reyting: -1 });
MahsulotSxema.index({ nom: 'text', tavsif: 'text' });

export const Mahsulot = model<MahsulotHujjat>('Mahsulot', MahsulotSxema);
