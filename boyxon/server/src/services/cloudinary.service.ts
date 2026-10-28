import { cloudinary, cloudinaryConfigured } from '../config/cloudinary';
import { ApiError } from '../utils/ApiError';
import { isWorkersRuntime } from '../utils/runtime';
import fs from 'node:fs';
import path from 'node:path';

/** Lokal saqlash papkasi (Cloudinary bo'lmagan holda ishlaydi). */
const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads', 'dishes');

// Workers'da fayl tizimi yo'q — papka yaratish faqat Node'da.
if (!isWorkersRuntime && !fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

/**
 * Rasmni yuklash.
 * - Cloudinary sozlangan bo'lsa — undan foydalanamiz.
 * - Sozlanmagan bo'lsa — Node'da `uploads/dishes` papkasiga saqlaymiz.
 * - Workers'da lokal fayl tizimi yo'q, shuning uchun Cloudinary majburiy.
 */
export async function uploadBufferToCloudinary(
  buffer: Buffer,
  folder = 'boyxon/dishes',
): Promise<{ url: string; publicId: string }> {
  if (cloudinaryConfigured) {
    try {
      const dataUri = `data:image/jpeg;base64,${buffer.toString('base64')}`;
      const res = await cloudinary.uploader.upload(dataUri, { folder });
      return { url: res.secure_url as string, publicId: res.public_id as string };
    } catch (e) {
      throw ApiError.badRequest(
        `Rasmni yuklashda xato: ${(e as Error)?.message ?? 'Cloudinary ga ulanib bo‘lmadi'}`,
      );
    }
  }

  if (isWorkersRuntime) {
    throw ApiError.badRequest(
      'Rasm yuklash uchun Cloudinary sozlanmagan. Cloudflare Workers’da lokal fayl saqlash mumkin emas.',
    );
  }

  // Fallback: lokal saqlash (faqat Node)
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 11)}.jpg`;
  const filePath = path.join(UPLOAD_DIR, fileName);
  fs.writeFileSync(filePath, buffer);

  const baseUrl = process.env.CLIENT_URL ?? 'http://localhost:5000';
  const publicUrl = `${baseUrl.replace(/\/api$/, '')}/uploads/dishes/${fileName}`;

  return { url: publicUrl, publicId: fileName };
}

/** Rasmni o'chirish — Cloudinary yoki lokal papkadan. */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  if (cloudinaryConfigured) {
    await cloudinary.uploader.destroy(publicId).catch(() => undefined);
  }

  if (isWorkersRuntime) return;

  // Lokal faylni ham o'chirish
  try {
    const filePath = path.join(UPLOAD_DIR, publicId);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch {
    // Fayl o'chirmada xato bo'lsa — asosiy jarayon to'xtamaydi
  }
}
