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
  lastLoginAt?: Date;
  comparePassword(candidate: string): Promise<boolean>;
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
    lastLoginAt: { type: Date },
  },
  { timestamps: true },
);

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
  delete obj.password;
  return obj;
};

export const User = model<UserDoc>('User', UserSchema);
