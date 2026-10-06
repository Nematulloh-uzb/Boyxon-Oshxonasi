import { Schema, model, type Document } from 'mongoose';

// OTP — SMS tasdiqlash kodi (Eskiz.uz orqali yuboriladi)
export type OtpMaqsad = 'royxat' | 'tiklash' | 'kirish';

export interface OtpHujjat extends Document {
  telefon: string; // "+998 90 123 45 67"
  kodHash: string; // bcrypt bilan
  maqsad: OtpMaqsad;
  urinish: number; // noto'g'ri urinishlar
  tasdiqlandi: boolean;
  amalMuddati: Date; // 5 daqiqa
  yaratilgan: Date;
  yangilangan: Date;
}

const OtpSxema = new Schema<OtpHujjat>(
  {
    telefon: {
      type: String,
      required: true,
      trim: true,
      match: [/^\+998 \d{2} \d{3} \d{2} \d{2}$/, "Telefon +998 XX XXX XX XX bo'lsin"],
    },
    kodHash: { type: String, required: true, select: false },
    maqsad: { type: String, enum: ['royxat', 'tiklash', 'kirish'], default: 'royxat' },
    urinish: { type: Number, default: 0, min: 0, max: 5 },
    tasdiqlandi: { type: Boolean, default: false },
    amalMuddati: { type: Date, required: true, expires: 0 },
  },
  { timestamps: { createdAt: 'yaratilgan', updatedAt: 'yangilangan' } },
);

OtpSxema.index({ telefon: 1, maqsad: 1, yaratilgan: -1 });

export const Otp = model<OtpHujjat>('Otp', OtpSxema);
