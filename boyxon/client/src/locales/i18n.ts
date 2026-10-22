import { useSyncExternalStore } from 'react';
import uzRaw from './uz.json';
import { HTML_LANG, langFromPath, normalizeLang, withLang, type SeoLang } from '../lib/seo';

/**
 * Yengil i18n: i18next o'rniga faqat kerakli qism.
 *
 * - O'zbek tili sinxron (birinchi render uchun) bundle'da.
 * - Rus/ingliz tillari alohida chunk sifatida faqat kerak bo'lganda yuklanadi.
 * - `useTranslation` til o'zgarganda komponentlarni qayta render qiladi.
 */
type Dict = Record<string, unknown>;

const dictionaries: Partial<Record<SeoLang, Dict>> = {};

function normalizeBraces(dict: Dict): Dict {
  const out: Dict = {};
  for (const [k, v] of Object.entries(dict)) {
    out[k] =
      typeof v === 'string'
        ? v.replace(/(?<!\{)\{([A-Za-z_][A-Za-z0-9_]*)\}(?!\})/g, '{{$1}}')
        : v;
  }
  return out;
}

dictionaries.uz = normalizeBraces(uzRaw as Dict);

const localeLoaders: Record<Exclude<SeoLang, 'uz'>, () => Promise<{ default: Dict }>> = {
  ru: () => import('./ru.json'),
  en: () => import('./en.json'),
};
const localeLoads = new Map<SeoLang, Promise<void>>();

function ensureLocale(lang: SeoLang): Promise<void> {
  if (dictionaries[lang]) return Promise.resolve();
  if (lang === 'uz') return Promise.resolve();
  const existing = localeLoads.get(lang);
  if (existing) return existing;
  const load = localeLoaders[lang]()
    .then((mod) => {
      dictionaries[lang] = normalizeBraces(mod.default);
    })
    .finally(() => {
      localeLoads.delete(lang);
    });
  localeLoads.set(lang, load);
  return load;
}

const urlLang = langFromPath();

function readStoredLang(): string | null {
  try {
    return localStorage.getItem('boyxon-lang');
  } catch {
    return null;
  }
}

const savedLang = normalizeLang(readStoredLang());
export const initialLang: SeoLang = urlLang ?? savedLang;

const PRIVATE_PREFIXES = [
  '/auth',
  '/verify-email',
  '/forgot-password',
  '/reset-password',
  '/admin',
  '/cart',
  '/settings',
  '/orders',
];
const pathname = window.location.pathname;
const isPrivatePath = PRIVATE_PREFIXES.some(
  (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
);
if (!urlLang && !isPrivatePath && (savedLang === 'ru' || savedLang === 'en')) {
  const target = withLang(pathname, savedLang) + window.location.search + window.location.hash;
  if (target !== pathname + window.location.search + window.location.hash) {
    // Reloadsiz: `location.replace` butun sahifani qayta yuklardi.
    // React mount bo'lishidan oldin URL'ni almashtiramiz — `Root` basename'ni
    // shu URL'dan oladi, shuning uchun qo'shimcha navigatsiya kerak emas.
    window.history.replaceState(window.history.state, '', target);
  }
}

let currentLang: SeoLang = initialLang;
let languageReady = false;
const reactListeners = new Set<() => void>();
const languageListeners = new Set<(lng: SeoLang) => void>();

function emit(): void {
  reactListeners.forEach((fn) => fn());
  languageListeners.forEach((fn) => fn(currentLang));
}

const INTERPOLATION =
  /\{\{\s*([A-Za-z_][A-Za-z0-9_]*)\s*\}\}|\{\s*([A-Za-z_][A-Za-z0-9_]*)\s*\}/g;

function interpolate(template: string, values?: Record<string, unknown>): string {
  if (!values) return template;
  return template.replace(INTERPOLATION, (match, doubleKey, singleKey) => {
    const key = (doubleKey ?? singleKey) as string;
    const value = values[key];
    return value === undefined || value === null ? match : String(value);
  });
}

function translate(key: string, values?: Record<string, unknown>): string {
  const current = dictionaries[currentLang];
  const fallback = dictionaries.uz;
  const raw = current?.[key] ?? fallback?.[key];
  if (typeof raw !== 'string') return key;
  return interpolate(raw, values);
}

async function init(): Promise<void> {
  await ensureLocale(initialLang);
  currentLang = initialLang;
  document.documentElement.lang = HTML_LANG[initialLang];
  languageReady = true;
}

async function changeLanguage(value: string): Promise<void> {
  const lang = normalizeLang(value);
  if (lang !== currentLang) {
    await ensureLocale(lang);
  }
  currentLang = lang;
  document.documentElement.lang = HTML_LANG[lang];
  if (languageReady) {
    try {
      localStorage.setItem('boyxon-lang', lang);
    } catch {
      // localStorage yozib bo'lmasa — til faqat shu sessiyada ishlaydi.
    }
  }
  emit();
}

const i18n = {
  get language(): SeoLang {
    return currentLang;
  },
  t: translate,
  changeLanguage,
  init,
  on(event: 'languageChanged', cb: (lng: SeoLang) => void): void {
    if (event === 'languageChanged') languageListeners.add(cb);
  },
  off(event: 'languageChanged', cb: (lng: SeoLang) => void): void {
    if (event === 'languageChanged') languageListeners.delete(cb);
  },
};

function subscribe(cb: () => void): () => void {
  reactListeners.add(cb);
  return () => reactListeners.delete(cb);
}

export function useTranslation(): {
  t: (key: string, values?: Record<string, unknown>) => string;
  i18n: typeof i18n;
} {
  useSyncExternalStore(subscribe, () => currentLang, () => currentLang);
  return { t: translate, i18n };
}

export default i18n;
