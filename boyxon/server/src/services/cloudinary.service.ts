import { cloudinary, cloudinaryConfigured } from '../config/cloudinary';
import { ApiError } from '../utils/ApiError';

export async function uploadBufferToCloudinary(
  buffer: Buffer,
  folder = 'boyxon/dishes',
): Promise<{ url: string; publicId: string }> {
  if (!cloudinaryConfigured)
    throw ApiError.badRequest(
      'Rasm yuklash xizmati sozlanmagan (Cloudinary kalitlari .env da yo‘q). Iltimos, hozircha rasmsiz saqlang yoki administrator Cloudinary ni sozlasin.',
    );
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

export async function deleteFromCloudinary(publicId: string): Promise<void> {
  if (!cloudinaryConfigured) return;
  await cloudinary.uploader.destroy(publicId).catch(() => undefined);
}
