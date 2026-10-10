import { Schema, model, type Document } from 'mongoose';

export interface PromoDoc extends Document {
  code: string;
  description?: string;
  type: 'percent' | 'fixed';
  value: number;
  minOrderAmount: number;
  maxDiscount?: number;
  usageLimit?: number | null;
  usedCount: number;
  perUserLimit: number;
  validFrom?: Date;
  validUntil?: Date;
  isActive: boolean;
}

const PromoSchema = new Schema<PromoDoc>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: String, trim: true },
    type: { type: String, enum: ['percent', 'fixed'], required: true },
    value: { type: Number, required: true, min: 0 },
    minOrderAmount: { type: Number, default: 0, min: 0 },
    maxDiscount: { type: Number, min: 0 },
    usageLimit: { type: Number, default: null },
    usedCount: { type: Number, default: 0, min: 0 },
    perUserLimit: { type: Number, default: 1, min: 1 },
    validFrom: { type: Date },
    validUntil: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Promo = model<PromoDoc>('Promo', PromoSchema);
