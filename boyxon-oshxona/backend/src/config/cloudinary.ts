import { v2 as cloudinary } from 'cloudinary';
import { env } from './env';

// Cloudinary sozlamasi — rasm URL'lar shu yerdan keladi (XATO 13 tuzatish)
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME || 'demo',
  api_key: env.CLOUDINARY_API_KEY || 'demo',
  api_secret: env.CLOUDINARY_API_SECRET || 'demo',
  secure: true,
});

export { cloudinary };

// Mahsulot rasmi uchun standart URL yasash (seed uchun)
export function rasmUrl(publicId: string, eni = 800): string {
  return cloudinary.url(publicId, {
    width: eni,
    crop: 'fill',
    quality: 'auto',
    fetch_format: 'auto',
  });
}
