/**
 * SEO uchun yagona manba: sayt URL'i, til prefikslari va canonical helpers.
 *
 * Tillar URL'da birinchi segment sifatida turadi:
 *   uz -> "/"            (default, prefikssiz)
 *   ru -> "/ru/..."
 *   en -> "/en/..."
 *
 * Shu tufayli har bir til uchun alohida, indekslanadigan URL bo'ladi.
 */

import { resolveRuntimeUrl } from './runtime-env';

export const SITE_URL = resolveRuntimeUrl(
  import.meta.env.VITE_SITE_URL as string | undefined,
  'http://localhost:5173',
  'https://boyxon-client.onrender.com',
).replace(/\/+$/, '');

export const SEO_LANGS = ['uz', 'ru', 'en'] as const;

export type SeoLang = (typeof SEO_LANGS)[number];

export const HTML_LANG: Record<SeoLang, string> = {
  uz: 'uz',
  ru: 'ru',
  en: 'en',
};

export const OG_LOCALE: Record<SeoLang, string> = {
  uz: 'uz_UZ',
  ru: 'ru_RU',
  en: 'en_US',
};

export function isSeoLang(value: string | null | undefined): value is SeoLang {
  return value === 'uz' || value === 'ru' || value === 'en';
}

/** URL pathidan tilni aniqlaydi. Prefiks bo'lmasa null (default: uz). */
export function langFromPath(pathname: string = window.location.pathname): SeoLang | null {
  const first = pathname.split('/').filter(Boolean)[0];
  return first === 'ru' || first === 'en' ? first : null;
}

/** Joriy URL tili (default uz). */
export function pathLang(pathname: string = window.location.pathname): SeoLang {
  return langFromPath(pathname) ?? 'uz';
}

/**
 * React Router basename: "/ru", "/en" yoki "/".
 * Shu sababli mavjud <Link to="/..."> larning barchasi avtomatik
 * til prefiksini saqlaydi — har bir sahifada linklarni o'zgartirish shart emas.
 */
export const BASENAME: string = (() => {
  const lang = langFromPath();
  return lang ? `/${lang}` : '/';
})();

/** "/ru/dish/palov" -> "/dish/palov"; "/ru" -> "/". */
export function stripLang(pathname: string): string {
  const lang = langFromPath(pathname);
  if (!lang) return pathname || '/';
  const rest = pathname.slice(lang.length + 1);
  if (!rest) return '/';
  return rest.startsWith('/') ? rest : `/${rest}`;
}

/** "/dish/palov" + "ru" -> "/ru/dish/palov"; "/" + "ru" -> "/ru". */
export function withLang(pathname: string, lang: SeoLang): string {
  const clean = stripLang(pathname);
  if (lang === 'uz') return clean;
  return clean === '/' ? `/${lang}` : `/${lang}${clean}`;
}

/** Nisbiy path -> to'liq URL (canonical, OG, JSON-LD uchun). */
export function absoluteUrl(pathname: string): string {
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
  // Kirill/bo'sh joyli sluglar ham to'g'ri, percent-encoded URL bo'lsin.
  return `${SITE_URL}${encodeURI(path)}`;
}

export function canonicalFor(pathname: string, lang: SeoLang): string {
  return absoluteUrl(withLang(pathname, lang));
}

/** i18next qaytargan tilni xavfsiz SeoLang ga aylantiradi (ru-RU, en-US ham). */
export function normalizeLang(value: string | null | undefined): SeoLang {
  const valueLower = (value ?? '').toLowerCase();
  if (valueLower === 'ru' || valueLower.startsWith('ru-') || valueLower.startsWith('ru_')) {
    return 'ru';
  }
  if (valueLower === 'en' || valueLower.startsWith('en-') || valueLower.startsWith('en_')) {
    return 'en';
  }
  return 'uz';
}
