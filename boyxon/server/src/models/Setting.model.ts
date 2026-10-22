import { Schema, model, type Document } from 'mongoose';

export interface SettingDoc extends Document {
  key: string;
  kitchenOpen: boolean;
  /** Karta o'tkazmasi uchun rekvizitlar (bo'sh bo'lsa — karta usuli ko'rsatilmaydi). */
  cardNumber?: string;
  cardHolder?: string;
}

const SettingSchema = new Schema<SettingDoc>(
  {
    key: { type: String, required: true, unique: true, default: 'main' },
    kitchenOpen: { type: Boolean, default: true },
    cardNumber: { type: String, default: '', trim: true, maxlength: 32 },
    cardHolder: { type: String, default: '', trim: true, maxlength: 80 },
  },
  { timestamps: true },
);

export const Setting = model<SettingDoc>('Setting', SettingSchema);
