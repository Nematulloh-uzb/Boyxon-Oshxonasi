import { createHash, randomInt, timingSafeEqual } from 'node:crypto';
import { User } from '../models/User.model';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';

/**
 * Email tasdiqlash kodi.
 *
 * Ro'yxatdan o'tganda 6 xonali kod emailga yuboriladi. Bazada kodning o'zi
 * emas, SHA-256 hash'i saqlanadi (JWT secret bilan "tuzlangan") — baza
 * o'g'irlansa ham kodni tiklab bo'lmaydi.
 *
 * Himoya:
 *   - kod 10 daqiqa amal qiladi;
 *   - 5 marta xato kiritilsa bloklanadi;
 *   - qayta yuborish orasida kamida 60 soniya;
 *   - muvaffaqiyatdan keyin kod o'chiriladi (bir martalik).
 */
export const VERIFY_CODE_LENGTH = 6;
export const VERIFY_CODE_TTL_MS = 10 * 60 * 1000;
export const VERIFY_CODE_RESEND_MS = 60 * 1000;
export const VERIFY_CODE_MAX_ATTEMPTS = 5;

/** Kod hash'i — userId bilan bog'langan, shuning uchun bir kod boshqa hisobga yaramaydi. */
export function hashVerificationCode(code: string, userId: string): string {
  return createHash('sha256').update(`${code}:${userId}:${env.JWT_ACCESS_SECRET}`).digest('hex');
}

export function generateVerificationCode(): string {
  return String(randomInt(0, 10 ** VERIFY_CODE_LENGTH)).padStart(VERIFY_CODE_LENGTH, '0');
}

function sameHash(a: string, b: string): boolean {
  const left = Buffer.from(a, 'hex');
  const right = Buffer.from(b, 'hex');
  return left.length === right.length && timingSafeEqual(left, right);
}

/**
 * Yangi kod yaratib, bazaga yozadi va kodni qaytaradi (emailga yuborish uchun).
 * Ataylab `updateOne` — to'liq hujjatni yuklab, saqlashdan tezroq.
 */
export async function issueVerificationCode(userId: string): Promise<string> {
  const code = generateVerificationCode();
  const now = Date.now();
  await User.updateOne(
    { _id: userId },
    {
      $set: {
        emailVerifyCodeHash: hashVerificationCode(code, userId),
        emailVerifyCodeExpiresAt: new Date(now + VERIFY_CODE_TTL_MS),
        emailVerifyCodeSentAt: new Date(now),
        emailVerifyCodeAttempts: 0,
      },
    },
  );
  return code;
}

/** Kodni qayta yuborish mumkinmi (60 soniya cooldown). */
export async function canResendVerificationCode(userId: string): Promise<boolean> {
  const user = await User.findById(userId).select('emailVerifyCodeSentAt').lean();
  const sentAt = user?.emailVerifyCodeSentAt ? new Date(user.emailVerifyCodeSentAt).getTime() : 0;
  return Date.now() - sentAt >= VERIFY_CODE_RESEND_MS;
}

/**
 * Kodni tekshiradi. To'g'ri bo'lsa `emailVerified` ni yoqadi va kodni o'chiradi.
 * Xato bo'lsa urinishlar sonini oshiradi va tushunarli xato qaytaradi.
 */
export async function consumeVerificationCode(email: string, code: string) {
  const user = await User.findOne({ email: email.toLowerCase() }).select('+emailVerifyCodeHash');
  if (!user) throw ApiError.badRequest('Kod noto‘g‘ri yoki muddati o‘tgan');
  if (!user.isActive) throw ApiError.forbidden('Hisob bloklangan');

  // Allaqachon tasdiqlangan — bu xato emas (masalan, ikki marta bosilgan).
  if (user.emailVerified) return { user, alreadyVerified: true as const };

  const expiresAt = user.emailVerifyCodeExpiresAt ? new Date(user.emailVerifyCodeExpiresAt).getTime() : 0;
  if (!user.emailVerifyCodeHash || !expiresAt) {
    throw ApiError.badRequest('Tasdiqlash kodi yuborilmagan — “Kodni qayta yuborish”ni bosing');
  }
  if (expiresAt < Date.now()) {
    throw ApiError.badRequest('Kod muddati o‘tgan — yangi kod so‘rang');
  }

  const attempts = user.emailVerifyCodeAttempts ?? 0;
  if (attempts >= VERIFY_CODE_MAX_ATTEMPTS) {
    throw new ApiError(429, 'Urinishlar tugadi — yangi kod so‘rang', 'VERIFY_CODE_LOCKED');
  }

  if (!sameHash(hashVerificationCode(code, user.id as string), user.emailVerifyCodeHash)) {
    user.emailVerifyCodeAttempts = attempts + 1;
    await user.save();
    const left = VERIFY_CODE_MAX_ATTEMPTS - user.emailVerifyCodeAttempts;
    throw ApiError.badRequest(
      left > 0 ? `Kod noto‘g‘ri. Yana ${left} ta urinish qoldi` : 'Urinishlar tugadi — yangi kod so‘rang',
    );
  }

  user.emailVerified = true;
  user.emailVerifyCodeHash = null;
  user.emailVerifyCodeExpiresAt = null;
  user.emailVerifyCodeAttempts = 0;
  await user.save();

  return { user, alreadyVerified: false as const };
}
