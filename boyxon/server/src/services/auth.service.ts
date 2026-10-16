import { User } from '../models/User.model';
import { RefreshSession } from '../models/RefreshSession.model';
import { signAccessToken, signRefreshToken, REFRESH_TTL_MS } from './token.service';
import { ApiError } from '../utils/ApiError';
import { checkEmailDeliverable } from '../utils/email-verify';
import { env } from '../config/env';
import { randomBytes } from 'node:crypto';

/**
 * Yangi refresh sessiyasi (bitta qurilma uchun) yaratadi va `sid` qaytaradi.
 * Har login/google/parol almashishda chaqiriladi — qurilmalar bir-biridan mustaqil.
 */
export async function createRefreshSession(userId: string, userAgent?: string): Promise<string> {
  const sid = randomBytes(32).toString('hex');
  await RefreshSession.create({
    user: userId,
    sid,
    userAgent: (userAgent ?? '').slice(0, 255),
    expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
    lastUsedAt: new Date(),
  });
  return sid;
}

/**
 * Token juftligini beradi. `tokenVersion` payload'ga kiradi — parol almashsa,
 * "hammasidan chiqish" qilinsa yoki hisob bloklansa, bu tokenlar darhol o'ladi.
 * Refresh token esa qo'shimcha `sid` (sessiya) bilan bog'lanadi — faqat o'sha
 * qurilma yangilay oladi (boshqa qurilmalar refresh qilishi o'z sessiyalariga tegmaydi).
 */
export function issueTokens(id: string, role: string, tokenVersion: number, sid: string) {
  return {
    accessToken: signAccessToken({ id, role, ver: tokenVersion }),
    refreshToken: signRefreshToken({ id, ver: tokenVersion, sid }),
  };
}

/**
 * Yangi hisob ochish.
 *
 * Email uch darajada tekshiriladi:
 *  1. Sintaksis (Zod + `checkEmailLocally`) — noto'g'ri format darhol rad etiladi.
 *  2. Bir martalik domenlar — "tempmail" kabi xizmatlar bloklanadi.
 *  3. MX yozuvi — domen umuman xat qabul qiladimi (DNS orqali).
 *
 * Diqqat: bu uchtasi ham "bu manzil haqiqatan sizniki" degan kafolat bermaydi.
 * Faqat emailga yuborilgan havola buni isbotlaydi (`verifyEmail`).
 */
export async function registerUser(
  input: { name: string; email: string; phone?: string; password: string },
  userAgent?: string,
) {
  const email = input.email.toLowerCase();

  const problem = await checkEmailDeliverable(email);
  if (problem) {
    throw ApiError.badRequest(problem.message);
  }

  const exists = await User.findOne({ email });
  if (exists) throw ApiError.conflict('Bu email allaqachon ro‘yxatda');

  const user = await User.create({
    name: input.name,
    email,
    phone: input.phone,
    password: input.password,
    emailVerified: false,
  });
  user.lastLoginAt = new Date();
  await user.save();
  const sid = await createRefreshSession(user.id as string, userAgent);
  return { user, ...issueTokens(user.id as string, user.role, user.tokenVersion ?? 0, sid) };
}

/**
 * Email + parol bilan kirish.
 *
 * Brute-force himoyasi: 5 marta xato parol kiritilsa hisob 15 daqiqaga qulflanadi.
 * Xato xabari har doim bir xil — email mavjudligini aniqlash (user enumeration)
 * imkoni bo'lmasligi uchun.
 *
 * Tasdiqlanmagan email: parol TO'G'RI bo'lsa ham kirishga ruxsat berilmaydi
 * (`ALLOW_UNVERIFIED_LOGIN` yoqilmagan bo'lsa). Tekshiruv parol tekshiruvidan
 * KEYIN bajariladi, shuning uchun xato urinishlar hisoblagichiga ta'sir qilmaydi.
 */
export async function loginUser(email: string, password: string) {
  const GENERIC = 'Email yoki parol noto‘g‘ri';
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (!user || !user.password) throw ApiError.unauthorized(GENERIC);
  if (!user.isActive) throw ApiError.forbidden('Hisob bloklangan');

  if (user.lockedUntil && user.lockedUntil > new Date()) {
    const minutes = Math.max(1, Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000));
    throw ApiError.forbidden(`Juda ko‘p xato urinish. ${minutes} daqiqadan keyin qayta urinib ko‘ring`);
  }

  const okPass = await user.comparePassword(password);
  if (!okPass) {
    await user.registerFailedLogin();
    // Qulflash yuz bergan bo'lsa aniq xabar, aks holda umumiy xato (enumeration'ga qarshi).
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      throw ApiError.forbidden('Juda ko‘p xato urinish. Hisob 15 daqiqaga bloklandi');
    }
    throw ApiError.unauthorized(GENERIC);
  }

  // Parol to'g'ri — endi email tasdiqlanganini tekshiramiz.
  if (!user.emailVerified && !env.ALLOW_UNVERIFIED_LOGIN) {
    throw ApiError.forbidden('EMAIL_NOT_VERIFIED');
  }

  await user.resetLoginAttempts();
  user.lastLoginAt = new Date();
  await user.save();

  return issueTokens(user.id as string, user.role, user.tokenVersion ?? 0);
}
