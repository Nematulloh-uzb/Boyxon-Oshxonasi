import { Schema, model, type Document, type Types } from 'mongoose';
import { Dish } from './Dish.model';

export interface ReviewDoc extends Document {
  user: Types.ObjectId;
  dish: Types.ObjectId;
  order?: Types.ObjectId;
  rating: number;
  comment?: string;
}

const ReviewSchema = new Schema<ReviewDoc>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    dish: { type: Schema.Types.ObjectId, ref: 'Dish', required: true, index: true },
    order: { type: Schema.Types.ObjectId, ref: 'Order' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, maxlength: 1000 },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

ReviewSchema.index({ user: 1, dish: 1 }, { unique: false });

/**
 * Bir buyurtmadagi bir taomga bir user faqat BITTA baho beradi.
 * Controller oldindan tekshiradi, bu index esa poyga (race) holatida
 * ikkinchi yozuvni DB darajasida rad etadi (11000 → toza 400).
 * order maydoni bo'sh eski review'lar bu index'ga tushmaydi (sparse).
 */
ReviewSchema.index({ order: 1, dish: 1, user: 1 }, { unique: true, sparse: true });

/**
 * Dish reyting + sharhlar sonini qayta hisoblab yozadi.
 *
 * Muhit: `insertMany` `post('save')` hook'ini ISHGA TUSHIRMAYDI, shuning uchun
 * bu logika alohida funksiyaga chiqarilgan — reviewOrder controller'i
 * insertMany'dan keyin buni chaqiradi. Aks holda baholar hech qachon
 * dish.rating ga tushmasdi.
 */
export async function recalcDishRating(dishId: unknown): Promise<void> {
  const agg = await Review.aggregate([
    { $match: { dish: dishId as never } },
    { $group: { _id: '$dish', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  if (agg[0]) {
    await Dish.findByIdAndUpdate(dishId, {
      rating: Math.round(agg[0].avg * 10) / 10,
      reviewCount: agg[0].count,
    });
  }
}

ReviewSchema.post('save', async function (doc) {
  await recalcDishRating(doc.dish);
});

export const Review = model<ReviewDoc>('Review', ReviewSchema);
