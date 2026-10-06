import mongoose from 'mongoose';
import { env } from './env';

// MongoDB ga ulanish — qayta urinish bilan
export async function dbUlanish(): Promise<void> {
  if (mongoose.connection.readyState === 1) return;
  mongoose.set('strictQuery', true);
  await mongoose.connect(env.MONGO_URI);
  // eslint-disable-next-line no-console
  console.log("✅ MongoDB ulandi");
}

// Testlar uchun uzish
export async function dbUzish(): Promise<void> {
  await mongoose.disconnect();
}
