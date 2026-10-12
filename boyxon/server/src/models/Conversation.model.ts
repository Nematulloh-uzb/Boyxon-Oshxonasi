import { Schema, model, type Document, type Types } from 'mongoose';

export interface ConversationDoc extends Document {
  user: Types.ObjectId;
  lastMessage?: string;
  lastSenderRole?: 'user' | 'admin';
  lastMessageAt?: Date;
  adminUnread: number; // admin o'qimagan xabarlar soni
  userUnread: number; // user o'qimagan xabarlar soni
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<ConversationDoc>(
  {
    // Har bir foydalanuvchi uchun bitta "support" suhbati (unique).
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    lastMessage: { type: String, default: '' },
    lastSenderRole: { type: String, enum: ['user', 'admin'] },
    lastMessageAt: { type: Date },
    adminUnread: { type: Number, default: 0 },
    userUnread: { type: Number, default: 0 },
  },
  { timestamps: true },
);

// Admin ro'yxati — oxirgi xabar bo'yicha saralanadi.
ConversationSchema.index({ lastMessageAt: -1 });

export const Conversation = model<ConversationDoc>('Conversation', ConversationSchema);
