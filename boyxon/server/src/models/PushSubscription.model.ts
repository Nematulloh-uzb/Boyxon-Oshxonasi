import { Schema, model, type Document, type Types } from 'mongoose';

export interface PushSubscriptionDoc extends Document {
  user: Types.ObjectId;
  endpoint: string;
  keys: { p256dh?: string; auth?: string };
  userAgent?: string;
}

const PushSubscriptionSchema = new Schema<PushSubscriptionDoc>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    endpoint: { type: String, required: true, unique: true },
    keys: {
      p256dh: { type: String },
      auth: { type: String },
    },
    userAgent: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const PushSubscription = model<PushSubscriptionDoc>(
  'PushSubscription',
  PushSubscriptionSchema,
);
