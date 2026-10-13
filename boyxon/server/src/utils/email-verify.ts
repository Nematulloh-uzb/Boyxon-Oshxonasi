import { promises as dns } from 'node:dns';

/**
 * Email manzilining "jiddiyligini" tekshirish uchun yordamchi vositalar.
 *
 * MUHIM HAQIQAT: email haqiqiyligini 100% aniqlashning yagona yo'li — tasdiqlash
 * havolasi yuborib, egasi bosishini kutish. Quyidagi tekshiruvlar arzon soxta
 * manzillarni filtrlaydi, lekin "haqiqiy hisob" kafolatini bermaydi.
 */

/**
 * Bir martalik (disposable) email domenlari.
 * Bular bir necha soniyada ochiladi va tashlab yuboriladi — spam/bot hisoblar uchun
 * eng ko'p ishlatiladigan xizmatlar.
 */
const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com',
  'guerrillamail.com',
  'guerrillamail.net',
  '10minutemail.com',
  '10minutemail.net',
  'tempmail.com',
  'temp-mail.org',
  'tempmail.net',
  'throwawaymail.com',
  'yopmail.com',
  'yopmail.fr',
  'sharklasers.com',
  'guerrillamailblock.com',
  'grr.la',
  'spam4.me',
  'trashmail.com',
  'trashmail.de',
  'dispostable.com',
  'maildrop.cc',
  'getnada.com',
  'nada.email',
  'fakeinbox.com',
  'mailnesia.com',
  'mohmal.com',
  'emailondeck.com',
  'moakt.com',
  'tempr.email',
  'discard.email',
  'mailcatch.com',
  'inboxkitten.com',
  'mailsac.com',
  'harakirimail.com',
  'mailnull.com',
  'spamgourmet.com',
  'mytemp.email',
  'burnermail.io',
  '33mail.com',
  'anonaddy.com',
  'simplelogin.com',
  'tempinbox.com',
  'mailtemp.info',
  'throwaway.email',
  'email-temp.com',
  'linshiyouxiang.net',
  'mvrht.net',
  'mail7.io',
]);

/** Mahalliy qismda ishlatilishi mumkin bo'lgan belgilar (RFC 5322 amaliy qismi). */
const LOCAL_PART_RE = /^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~.-]+$/;
/** Domen: kamida bitta nuqta, TLD harflardan. */
const DOMAIN_RE = /^(?=.{1,253}$)([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;

export interface EmailProblem {
  /** Foydalanuvchiga ko'rsatiladigan xabar. */
  message: string;
  /** Mashina o'qiydigan kod (frontend uchun). */
  code: 'format' | 'disposable' | 'no_mx';
}

/**
 * Sintaksis + bir martalik domen tekshiruvi (tez, tarmoqsiz).
 * Bu daraja har bir ro'yxatdan o'tishda ishlaydi.
 */
export function checkEmailLocally(email: string): EmailProblem | null {
  const value = email.trim().toLowerCase();
  const at = value.lastIndexOf('@');
  if (at < 1) return { message: 'Email formati noto‘g‘ri', code: 'format' };

  const local = value.slice(0, at);
  const domain = value.slice(at + 1);

  if (local.length > 64 || value.length > 254) {
    return { message: 'Email juda uzun', code: 'format' };
  }
  if (!LOCAL_PART_RE.test(local) || local.startsWith('.') || local.endsWith('.') || local.includes('..')) {
    return { message: 'Email formati noto‘g‘ri', code: 'format' };
  }
  if (!DOMAIN_RE.test(domain)) {
    return { message: 'Email domeni noto‘g‘ri (masalan: ism@gmail.com)', code: 'format' };
  }
  if (DISPOSABLE_DOMAINS.has(domain)) {
    return {
      message: 'Bir martalik email manzillar qabul qilinmaydi. Doimiy emailingizni kiriting.',
      code: 'disposable',
    };
  }
  return null;
}

/** MX natijalarini vaqtincha keshlaydi — har so'rovda DNS so'ramaslik uchun. */
const mxCache = new Map<string, { ok: boolean; expiresAt: number }>();
const MX_CACHE_TTL_MS = 10 * 60 * 1000;

/**
 * Domenning MX (yoki A) yozuvi borligini tekshiradi.
 *
 * MX yozuvi — "bu domenda email qabul qiluvchi server bor" degani. Agar domen
 * umuman mavjud bo'lmasa yoki xat qabul qilmasa — manzil kafolatli soxta.
 *
 * Diqqat: bu tekshiruv FAQAT domenni tasdiqlaydi, konkret pochta qutisi
 * mavjudligini emas. "ism@gmail.com" MX dan o'tadi, hatto bunday hisob
 * bo'lmasa ham. Buni faqat tasdiqlash havolasi aniqlaydi.
 *
 * Xatolik (tarmoq/DNS ishlamadi) bo'lsa `true` qaytaramiz — DNS muammosi
 * tufayli haqiqiy mijozni ro'yxatdan o'tkazmay qo'yish xato bo'lardi.
 */
export async function domainAcceptsMail(domain: string, timeoutMs = 3000): Promise<boolean> {
  const key = domain.toLowerCase();
  const cached = mxCache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.ok;

  const withTimeout = <T>(p: Promise<T>): Promise<T> =>
    Promise.race([
      p,
      new Promise<T>((_, reject) => setTimeout(() => reject(new Error('timeout')), timeoutMs)),
    ]);

  let ok = true;
  try {
    const mx = await withTimeout(dns.resolveMx(key));
    ok = mx.length > 0;
    if (!ok) {
      // Ba'zi domenlar MX o'rniga A yozuvi orqali xat qabul qiladi (RFC 5321).
      const a = await withTimeout(dns.resolve4(key));
      ok = a.length > 0;
    }
  } catch (e) {
    const code = (e as { code?: string }).code;
    // Domen umuman yo'q yoki MX yozuvi topilmadi — bu aniq javob.
    if (code === 'ENOTFOUND' || code === 'ENODATA') ok = false;
    // Boshqa xatolar (timeout, tarmoq yo'q) — mijozni ayblamaymiz.
    else ok = true;
  }

  mxCache.set(key, { ok, expiresAt: Date.now() + MX_CACHE_TTL_MS });
  return ok;
}

/**
 * To'liq tekshiruv: sintaksis → bir martalik domen → MX.
 * Xato bo'lsa tushunarli xabar qaytaradi, aks holda `null`.
 */
export async function checkEmailDeliverable(email: string): Promise<EmailProblem | null> {
  const local = checkEmailLocally(email);
  if (local) return local;

  const domain = email.trim().toLowerCase().split('@').pop() as string;
  const accepts = await domainAcceptsMail(domain);
  if (!accepts) {
    return {
      message: `"${domain}" domeni email qabul qilmaydi. Manzilni tekshiring.`,
      code: 'no_mx',
    };
  }
  return null;
}

/** Test uchun: keshlangan MX natijalarini tozalash. */
export function clearMxCache(): void {
  mxCache.clear();
}
