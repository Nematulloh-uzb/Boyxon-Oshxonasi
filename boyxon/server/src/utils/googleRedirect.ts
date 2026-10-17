/**
 * Google OAuth native (mobil) oqimida qaytish manzillari bilan ishlash.
 *
 * Ilova o'zining qaytish manzilini `/google?native=1&redirect=...` orqali yuboradi:
 *  - Expo Go:  exp://10.0.2.2:8081/--/auth/callback
 *  - APK/dev build: boyxon://auth/callback
 * Manzil Google'ga `state` ichida boradi va callback'da o'sha holicha qaytadi.
 *
 * Xavfsizlik: faqat ilova sxemalari qabul qilinadi — bu open redirect'ning oldini oladi.
 */

/** Ilova (native) sxemalari — boshqa har qanday manzil rad etiladi. */
const APP_REDIRECT_PREFIXES = ['boyxon://', 'exp://', 'exps://'] as const;

/** Ilova manzil yubormaganda ishlatiladigan standart qaytish manzili (APK oqimi). */
export const NATIVE_RETURN_URL = 'boyxon://auth/callback';

/**
 * Ilova yuborgan qaytish manzilini tekshiradi.
 * Yaroqsiz bo'lsa `null` — chaqiruvchi standart manzilga qaytadi.
 */
export function sanitizeAppRedirect(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const value = raw.trim();
  if (!value || value.length > 300) return null;
  // Fragment bo'lsa `?code=...` noto'g'ri joyga tushadi — rad etamiz.
  if (value.includes('#')) return null;
  const lower = value.toLowerCase();
  if (!APP_REDIRECT_PREFIXES.some((prefix) => lower.startsWith(prefix))) return null;
  return value;
}

export interface GoogleStateInfo {
  /** Mobil (ilova) oqimi — deep-link bilan qaytadigan. */
  native: boolean;
  /** Ilova yuborgan aniq qaytish manzili (bo'lsa). */
  redirect: string | null;
}

/**
 * Google `state` parametridan oqim ma'lumotlarini ajratib oladi.
 * `state` ikki ko'rinishda bo'ladi:
 *  - 'native=1' (ilova manzil yubormagan eski oqim)
 *  - JSON: {"native":"1","redirect":"exp://..."} (ilova manzil yuborgan)
 */
export function parseGoogleState(raw: unknown): GoogleStateInfo {
  const stateStr = Array.isArray(raw) ? raw.join('') : String(raw ?? '');
  let native = stateStr.includes('native=1');
  let redirect: string | null = null;
  try {
    const parsed = JSON.parse(stateStr) as { native?: unknown; redirect?: unknown } | null;
    if (parsed && typeof parsed === 'object') {
      if (parsed.native === '1') native = true;
      redirect = sanitizeAppRedirect(parsed.redirect);
    }
  } catch {
    /* state oddiy string (masalan 'native=1') — yuqorida tekshirildi */
  }
  if (redirect) native = true; // ilova manzili bo'lsa — bu mobil oqim
  return { native, redirect };
}
