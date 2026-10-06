import { Schema, model, type Document, type Types } from 'mongoose';

// Foydalanuvchi roli — admin Telegram bot orqali (ilovada admin YO'Q)
export type FoydalanuvchiRoli = 'mijoz' | 'kuryer' | 'oshpaz';

export interface Manzil {
  _id?: Types.ObjectId;
  nom: string; // "Uy", "Ish"
  manzil: string; // "Toshkent, Yunusobod..."
  moljal?: string;
  lat?: number;
  lng?: number;
  asosiy: boolean;
}

export interface FoydalanuvchiHujjat extends Document {
  ism: string;
  telefon: string; // "+998 90 123 45 67" formatda saqlanadi
  telefonTasdiqlangan: boolean;
  parolHash: string;
  rol: FoydalanuvchiRoli;
  avatarUrl?: string;
  tugilganKun?: Date;
  til: 'uz' | 'ru' | 'en';
  bildirishnoma: boolean;
  manzillar: Manzil[];
  telegramId?: string;
  yaratilgan: Date;
  yangilangan: Date;
}

const ManzilSxema = new Schema<Manzil>(
  {
    nom: { type: String, required: true, trim: true, maxlength: 30 },
    manzil: { type: String, required: true, trim: true, maxlength: 200 },
    moljal: { type: String, trim: true, maxlength: 200 },
    lat: { type: Number, min: -90, max: 90 },
    lng: { type: Number, min: -180, max: 180 },
    asosiy: { type: Boolean, default: false },
  },
  { _id: true },
);

const FoydalanuvchiSxema = new Schema<FoydalanuvchiHujjat>(
  {
    ism: { type: String, required: true, trim: true, minlength: 2, maxlength: 60 },
    // Telefon unikal — har doim "+998 XX XXX XX XX" formatda
    telefon: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: [/^\+998 \d{2} \d{3} \d{2} \d{2}$/, "Telefon +998 XX XXX XX XX bo'lsin"],
    },
    telefonTasdiqlangan: { type: Boolean, default: true },
    parolHash: { type: String, required: true, select: false },
    rol: { type: String, enum: ['mijoz', 'kuryer', 'oshpaz'], default: 'mijoz' },
    avatarUrl: { type: String, trim: true },
    tugilganKun: { type: Date },
    til: { type: String, enum: ['uz', 'ru', 'en'], default: 'uz' },
    bildirishnoma: { type: Boolean, default: true },
    manzillar: { type: [ManzilSxema], default: [] },
    telegramId: { type: String, trim: true },
  },
  { timestamps: { createdAt: 'yaratilgan', updatedAt: 'yangilangan' } },
);

FoydalanuvchiSxema.index({ telefon: 1 }, { unique: true });

export const Foydalanuvchi = model<FoydalanuvchiHujjat>('Foydalanuvchi', FoydalanuvchiSxema);
