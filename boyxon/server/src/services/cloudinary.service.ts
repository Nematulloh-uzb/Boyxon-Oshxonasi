import { cloudinary, cloudinaryConfigured } from '../config/cloudinary';

export async function uploadBufferToCloudinary(
  buffer: Buffer,
  folder = 'boyxon/dishes',
): Promise<{ url: string; publicId: string }> {
  if (!cloudinaryConfigured) throw new Error('Cloudinary sozlanmagan');
  const dataUri = `data:image/jpeg;base64,${buffer.toString('base64')}`;
  const res = await cloudinary.uploader.upload(dataUri, { folder });
  return { url: res.secure_url as string, publicId: res.public_id as string };
}

export async function deleteFromCloudinary(publicId: string): Promise<void> {
  if (!cloudinaryConfigured) return;
  await cloudinary.uploader.destroy(publicId).catch(() => undefined);
}
