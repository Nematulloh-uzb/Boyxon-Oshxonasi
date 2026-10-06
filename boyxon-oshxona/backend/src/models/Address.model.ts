import { Schema, model, type Document, type Types } from 'mongoose';

// Yetkazish manzili — alohida kolleksiya (foydalanuvchiga bog'langan)
export interface ManzilHujjat extends Document {
  foydalanuvchi: Types.ObjectId;
  nom: string; // "Uy", "Ish"
  manzil: string;
  moljal?: string;
  lat?: number;
  lng?: number;
  asosiy: boolean;
  yaratilgan: Date;
  yangilangan: Date;
}

const ManzilSxema = new Schema<ManzilHujjat>(
  {
    foydalanuvchi: { type: Schema.Types.ObjectId, ref: 'Foydalanuvchi', required: true },
    nom: { type: String, required: true, trim: true, maxlength: 30 },
    manzil: { type: String, required: true, trim: true, maxlength: 200 },
    moljal: { type: String, trim: true, maxlength: 200 },
    lat: { type: Number, min: -90, max: 90 },
    lng: { type: Number, min: -180, max: 180 },
    asosiy: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: 'yaratilgan', updatedAt: 'yangilangan' } },
);

ManzilSxema.index({ foydalanuvchi: 1, asosiy: 1 });

export const Manzil = model<ManzilHujjat>('Manzil', ManzilSxema);
