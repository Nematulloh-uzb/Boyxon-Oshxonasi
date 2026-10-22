import { Schema, model, type Document } from 'mongoose';

export interface SettingDoc extends Document {
  key: string;
  kitchenOpen: boolean;
}

const SettingSchema = new Schema<SettingDoc>(
  {
    key: { type: String, required: true, unique: true, default: 'main' },
    kitchenOpen: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const Setting = model<SettingDoc>('Setting', SettingSchema);
