import { Schema, model, type Document, type Types } from 'mongoose';

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'on_way' | 'delivered' | 'cancelled';

export interface OrderItem {
  dish: Types.ObjectId;
  name: string;
  nameRu?: string;
  nameEn?: string;
  price: number;
  quantity: number;
  customizations?: string;
}

export interface OrderDoc extends Document {
  orderNumber: string;
  user: Types.ObjectId;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  promoCode?: string;
  deliveryType: 'delivery' | 'pickup';
  address?: { label?: string; address?: string; lat?: number; lng?: number };
  paymentMethod: 'payme' | 'click' | 'uzum' | 'cash';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  status: OrderStatus;
  statusHistory: { status: string; timestamp: Date; note?: string }[];
  courier?: { name?: string; phone?: string };
  estimatedDeliveryAt?: Date;
  deliveredAt?: Date;
  cancelReason?: string;
  notes?: string;
}

const OrderItemSchema = new Schema<OrderItem>(
  {
    dish: { type: Schema.Types.ObjectId, ref: 'Dish', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    customizations: { type: String },
  },
  { _id: false },
);

const OrderSchema = new Schema<OrderDoc>(
  {
    orderNumber: { type: String, unique: true, sparse: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: { type: [OrderItemSchema], required: true },
    subtotal: { type: Number, required: true, min: 0 },
    deliveryFee: { type: Number, default: 0, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    promoCode: { type: String, uppercase: true, trim: true },
    deliveryType: { type: String, enum: ['delivery', 'pickup'], required: true },
    address: {
      label: String,
      address: String,
      lat: Number,
      lng: Number,
    },
    paymentMethod: { type: String, enum: ['payme', 'click', 'uzum', 'cash'], required: true },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'preparing', 'on_way', 'delivered', 'cancelled'],
      default: 'pending',
      index: true,
    },
    statusHistory: [
      {
        status: String,
        timestamp: { type: Date, default: Date.now },
        note: String,
      },
    ],
    courier: { name: String, phone: String },
    estimatedDeliveryAt: { type: Date },
    deliveredAt: { type: Date },
    cancelReason: { type: String },
    notes: { type: String, maxlength: 500 },
  },
  { timestamps: true },
);

OrderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    for (let i = 0; i < 5; i++) {
      const candidate = 'BYX-' + Math.floor(1000 + Math.random() * 9000);
      const exists = await (this.constructor as typeof Order).findOne({ orderNumber: candidate });
      if (!exists) {
        this.orderNumber = candidate;
        break;
      }
    }
    if (!this.orderNumber) this.orderNumber = 'BYX-' + Date.now().toString().slice(-6);
  }
  if (this.isNew && this.statusHistory.length === 0) {
    this.statusHistory.push({ status: 'pending', timestamp: new Date() });
  }
  next();
});

export const Order = model<OrderDoc>('Order', OrderSchema);
