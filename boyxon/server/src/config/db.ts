import mongoose from 'mongoose';
import { env } from './env';

/** MongoDB Atlas ulanishi. */
export async function connectDb(): Promise<void> {
  if (mongoose.connection.readyState === 1) return;
  mongoose.set('strictQuery', true);
  await mongoose.connect(env.MONGODB_URI);
  console.log('✅ MongoDB ulandi');
}

export async function disconnectDb(): Promise<void> {
  await mongoose.disconnect();
}
