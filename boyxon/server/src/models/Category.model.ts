import { Schema, model, type Document } from 'mongoose';

export interface CategoryDoc extends Document {
  name: string;
  nameRu?: string;
  nameEn?: string;
  slug: string;
  icon?: string;
  order: number;
  isActive: boolean;
}

const CategorySchema = new Schema<CategoryDoc>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    nameRu: { type: String, trim: true },
    nameEn: { type: String, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    icon: { type: String, trim: true },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Category = model<CategoryDoc>('Category', CategorySchema);
