import multer from 'multer';

const storage = multer.memoryStorage();

function fileFilter(_req: unknown, file: Express.Multer.File, cb: multer.FileFilterCallback): void {
  if (file.mimetype.startsWith('image/')) cb(null, true);
  else cb(new Error('Faqat rasm yuklash mumkin'));
}

/** Rasm yuklash — hotirada saqlaydi, keyin Cloudinary ga yuboriladi. */
export const uploadImage = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter,
});
