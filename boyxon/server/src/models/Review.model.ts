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

ReviewSchema.post('save', async function () {
  const dishId = this.dish;
  const agg = await model('Review').aggregate([
    { $match: { dish: dishId } },
    { $group: { _id: '$dish', avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  if (agg[0]) {
    await Dish.findByIdAndUpdate(dishId, {
      rating: Math.round(agg[0].avg * 10) / 10,
      reviewCount: agg[0].count,
    });
  }
});

export const Review = model<ReviewDoc>('Review', ReviewSchema);
