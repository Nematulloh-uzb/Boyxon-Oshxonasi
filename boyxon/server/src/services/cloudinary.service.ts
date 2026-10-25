import { cloudinary, cloudinaryConfigured } from '../config/cloudinary';
import { ApiError } from '../utils/ApiError';
import fs from 'node:fs';
import path from 'node:path';

/** Lokal saqlash papkasi (Cloudinary bo'lmagan holda ishlaydi). */
const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads', 'dishes');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

/**
 * Rasmni yuklash.
 * - Cloudinary sozlangan bo'lsa — undan foydalanamiz.
 * - Sozlanmagan bo'lsa — serverning o'zi `uploads/dishes` papkasiga saqlaymiz.
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

  // Fallback: lokal saqlash
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
