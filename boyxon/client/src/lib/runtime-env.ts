const LOCAL_URL_RE = /localhost|127\.0\.0\.1/i;

/**
 * Build-time URL'ni tanlaydi.
 *
 * Production build'da `.env` dagi localhost qiymati qolib ketmasin: agar
 * qiymat localhost bo'lsa, production manzil ishlatiladi. Bu SEO (canonical,
 * API ma'lumotlari) va ilovaning prod'da ishlashini kafolatlaydi.
 */
export function resolveRuntimeUrl(
  configured: string | undefined,
  devFallback: string,
  prodFallback: string,
): string {
  if (configured && !(import.meta.env.PROD && LOCAL_URL_RE.test(configured))) {
    return configured;
  }
  return import.meta.env.DEV ? devFallback : prodFallback;
}
