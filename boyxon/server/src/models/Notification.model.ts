import { Schema, model, type Document, type Types } from 'mongoose';

export interface NotificationDoc extends Document {
  user: Types.ObjectId;
  type: 'order' | 'promo' | 'system' | 'new_dish' | 'bonus';
  title: string;
  message: string;
  icon?: string;
  link?: string;
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<NotificationDoc>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: ['order', 'promo', 'system', 'new_dish', 'bonus'],
      required: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    message: { type: String, required: true, trim: true, maxlength: 1000 },
    icon: { type: String },
    link: { type: String },
    isRead: { type: Boolean, default: false, index: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

NotificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

export const Notification = model<NotificationDoc>('Notification', NotificationSchema);
