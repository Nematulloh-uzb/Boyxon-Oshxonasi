import { Schema, model, type Document, type Types } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface Address {
  _id?: Types.ObjectId;
  label: string;
  address: string;
  isDefault: boolean;
}

export interface NotificationPrefs {
  pushEnabled: boolean;
}

export interface UserPrefs {
  language: 'uz' | 'ru' | 'en';
  theme: 'light' | 'dark';
  fontSize: 'small' | 'medium' | 'large';
}

export interface UserDoc extends Document {
  name: string;
  email: string;
  phone?: string;
  password?: string;
  googleId?: string;
  avatar?: string | null;
  role: 'user' | 'admin';
  addresses: Address[];
  favorites: Types.ObjectId[];
  bonusBalance: number;
  notificationPrefs: NotificationPrefs;
  preferences: UserPrefs;
  isActive: boolean;
  /**
   * Email egasi tasdiqlanganmi. Ro'yxatdan o'tganda `false` bo'ladi va faqat
   * emailga yuborilgan havola bosilganda `true` ga o'tadi. Google OAuth orqali
   * kirganlarda darhol `true` (Google emailni o'zi tasdiqlagan).
   */
  emailVerified: boolean;
  lastLoginAt?: Date;
  /**
   * Token avlodi. Har oshirilganda foydalanuvchining BARCHA eski access/refresh
   * tokenlari bir zumda kuchini yo'qotadi (parol almashganda, bloklanganda, chiqishda).
   */
  tokenVersion: number;
  failedLoginAttempts: number;
  lockedUntil?: Date | null;
  comparePassword(candidate: string): Promise<boolean>;
  /** Barcha mavjud tokenlarni bekor qiladi. */
  bumpTokenVersion(): Promise<void>;
  /** Muvaffaqiyatli kirishdan keyin hisoblagichlarni tozalaydi. */
  resetLoginAttempts(): Promise<void>;
  /** Muvaffaqiyatsiz urinishni qayd etadi va kerak bo'lsa hisobni vaqtincha bloklaydi. */
  registerFailedLogin(): Promise<number>;
}

const AddressSchema = new Schema<Address>(
  {
    label: { type: String, required: true, trim: true, maxlength: 30 },
    address: { type: String, required: true, trim: true, maxlength: 300 },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true },
);

const UserSchema = new Schema<UserDoc>(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    phone: { type: String, sparse: true, trim: true },
    password: { type: String, select: false },
    googleId: { type: String, unique: true, sparse: true },
    avatar: { type: String, default: null },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    addresses: { type: [AddressSchema], default: [] },
    favorites: { type: [{ type: Schema.Types.ObjectId, ref: 'Dish' }], default: [] },
    bonusBalance: { type: Number, default: 0, min: 0 },
    notificationPrefs: {
      pushEnabled: { type: Boolean, default: true },
    },
    preferences: {
      language: { type: String, enum: ['uz', 'ru', 'en'], default: 'uz' },
      theme: { type: String, enum: ['light', 'dark'], default: 'light' },
      fontSize: { type: String, enum: ['small', 'medium', 'large'], default: 'medium' },
    },
    isActive: { type: Boolean, default: true },
    emailVerified: { type: Boolean, default: false },
    lastLoginAt: { type: Date },
    tokenVersion: { type: Number, default: 0 },
    failedLoginAttempts: { type: Number, default: 0 },
    lockedUntil: { type: Date, default: null },
  },
  { timestamps: true },
);

/** Brute-force himoyasi sozlamalari. */
const MAX_FAILED_ATTEMPTS = 5;
const LOCK_MINUTES = 15;

UserSchema.methods.bumpTokenVersion = async function (): Promise<void> {
  this.tokenVersion = (this.tokenVersion ?? 0) + 1;
  await this.save();
};

UserSchema.methods.resetLoginAttempts = async function (): Promise<void> {
  if (this.failedLoginAttempts === 0 && !this.lockedUntil) return;
  this.failedLoginAttempts = 0;
  this.lockedUntil = null;
  await this.save();
};

UserSchema.methods.registerFailedLogin = async function (): Promise<number> {
  this.failedLoginAttempts = (this.failedLoginAttempts ?? 0) + 1;
  if (this.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
    this.lockedUntil = new Date(Date.now() + LOCK_MINUTES * 60 * 1000);
    this.failedLoginAttempts = 0;
  }
  await this.save();
  return this.failedLoginAttempts;
};

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

UserSchema.methods.comparePassword = function (candidate: string): Promise<boolean> {
  if (!this.password) return Promise.resolve(false);
  return bcrypt.compare(candidate, this.password);
};

UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  /**
   * Ichki maydonlarni javobdan olib tashlaymiz:
   * - password — hech qachon chiqmasligi kerak;
   * - tokenVersion / failedLoginAttempts / lockedUntil — xavfsizlik holati.
   *   Bularni mijozga ko'rsatish orqali hujumchi hisobning qulflanganini yoki
   *   sessiya avlodini bilib olardi (ma'lumot oshkor bo'lishi).
   */
  delete obj.password;
  delete obj.tokenVersion;
  delete obj.failedLoginAttempts;
  delete obj.lockedUntil;
  return obj;
};

export const User = model<UserDoc>('User', UserSchema);
