import mongoose, { Schema, type Types } from 'mongoose';

/**
 * Refresh sessiyalari — har bir qurilma/brauzer uchun ALOHIDA yozuv.
 *
 * Nega kerak edi: ilgari har `refresh` da foydalanuvchining global `tokenVersion`
 * i oshirilardi. Natijada telefon + noutbuk bilan kirgan mijoz ikkinchisidan
 * majburan chiqarib yuborilardi (bir refresh — barcha qurilmalar o'limi).
 * Endi refresh faqat o'z sessiyasini yangilaydi:
 *
 *  - login / register / google / parol almashish → yangi sessiya + `sid` li refresh token
 *  - refresh → faqat shu `sid` tekshiriladi va muddati cho'ziladi (sliding)
 *  - logout → faqat shu qurilma sessiyasi o'chadi
 *  - logout-all / bloklash / parol almashish → barcha sessiyalar o'chadi (+ tokenVersion)
 *
 * TTL indeks: muddati o'tgan yozuvlarni MongoDB o'zi tozalaydi.
 */
export interface IRefreshSession {
  user: Types.ObjectId;
  sid: string;
  /** Diagnostika uchun (qaysi qurilma ekanini aniqlash), max 255 belgi. */
  userAgent: string;
  expiresAt: Date;
  lastUsedAt: Date;
}

const refreshSessionSchema = new Schema<IRefreshSession>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    sid: { type: String, required: true },
    userAgent: { type: String, default: '', maxlength: 255 },
    expiresAt: { type: Date, required: true },
    lastUsedAt: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

// Bitta user ichida sid takrorlanmasligi kafolatlanadi (bir xil qurilma ikki marta emas).
refreshSessionSchema.index({ user: 1, sid: 1 }, { unique: true });

// TTL — `expiresAt` kelganda yozuv avtomatik o'chadi.
refreshSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RefreshSession = mongoose.model<IRefreshSession>('RefreshSession', refreshSessionSchema);
