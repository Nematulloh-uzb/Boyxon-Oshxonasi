import { Schema, model, type Document } from 'mongoose';

interface HisoblagichHujjat extends Document<string> {
  qiymat: number;
}

const HisoblagichSxema = new Schema<HisoblagichHujjat>({
  _id: { type: String, required: true },
  qiymat: { type: Number, required: true, default: 0 },
});

export const Hisoblagich = model<HisoblagichHujjat>('Hisoblagich', HisoblagichSxema);
