import { Schema, model, type Document } from 'mongoose';

// Kategoriya — Asosiy ekrandagi gorizontal ro'yxat
export interface KategoriyaHujjat extends Document {
  nom: string; // "Oshlar", "Sho'rvalar"...
  slug: string; // "oshlar"
  rasmUrl: string; // Cloudinary URL (XATO 13)
  tartib: number;
  faol: boolean;
  yaratilgan: Date;
  yangilangan: Date;
}

const KategoriyaSxema = new Schema<KategoriyaHujjat>(
  {
    nom: { type: String, required: true, trim: true, maxlength: 60 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    rasmUrl: { type: String, required: true, trim: true },
    tartib: { type: Number, default: 0 },
    faol: { type: Boolean, default: true },
  },
  { timestamps: { createdAt: 'yaratilgan', updatedAt: 'yangilangan' } },
);

KategoriyaSxema.index({ slug: 1 }, { unique: true });
KategoriyaSxema.index({ tartib: 1, faol: 1 });

export const Kategoriya = model<KategoriyaHujjat>('Kategoriya', KategoriyaSxema);
