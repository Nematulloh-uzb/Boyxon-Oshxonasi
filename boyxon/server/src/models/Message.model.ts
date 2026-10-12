import { Schema, model, type Document, type Types } from 'mongoose';

export interface MessageDoc extends Document {
  conversation: Types.ObjectId;
  sender: Types.ObjectId;
  senderRole: 'user' | 'admin';
  text: string;
  readAt?: Date | null;
  createdAt: Date;
}

const MessageSchema = new Schema<MessageDoc>(
  {
    conversation: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    senderRole: { type: String, enum: ['user', 'admin'], required: true },
    text: { type: String, required: true, trim: true, maxlength: 2000 },
    readAt: { type: Date, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

// Suhbat ichidagi xabarlar vaqt bo'yicha o'sish tartibida o'qiladi.
MessageSchema.index({ conversation: 1, createdAt: 1 });

export const Message = model<MessageDoc>('Message', MessageSchema);
