import multer from 'multer';

const storage = multer.memoryStorage();

/**
 * Faqat xavfsiz rastr formatlar. `image/*` kabi keng filtrdan ataylab voz kechdik:
 * SVG (`image/svg+xml`) aslida skript saqlaydigan hujjat — uni yuklab, keyin
 * to'g'ridan-to'g'ri ochish XSS ga olib keladi.
 */
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']);

/** Kengaytma bo'yicha ham tekshiramiz (mijoz mimetype'ni soxtalashtirishi mumkin). */
const ALLOWED_EXT = /\.(jpe?g|png|webp|gif|avif)$/i;

function fileFilter(_req: unknown, file: Express.Multer.File, cb: multer.FileFilterCallback): void {
  const mimeOk = ALLOWED_MIME.has(file.mimetype);
  const extOk = ALLOWED_EXT.test(file.originalname);
  if (mimeOk && extOk) return cb(null, true);
  cb(new Error('Faqat rasm (JPEG, PNG, WebP, GIF) yuklash mumkin'));
}

/** Rasm yuklash — xotirada saqlaydi, keyin Cloudinary ga yuboriladi. */
export const uploadImage = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
    // Maydonlar soni va nomi cheklanadi — kutilmagan yuklamalarga qarshi.
    fields: 10,
    parts: 12,
  },
  fileFilter,
});
