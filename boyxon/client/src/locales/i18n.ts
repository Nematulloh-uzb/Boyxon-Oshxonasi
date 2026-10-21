import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import uz from './uz.json';
import ru from './ru.json';
import en from './en.json';
import { HTML_LANG, langFromPath, normalizeLang, withLang } from '../lib/seo';

const urlLang = langFromPath();

function readStoredLang(): string | null {
  try {
    return localStorage.getItem('boyxon-lang');
  } catch {
    // localStorage o'chirilgan/ruxsat berilmagan bo'lsa — URL tili ishlatiladi.
    return null;
  }
}

/**
 * URL'dagi til prefiksi ustuvor. Prefiks bo'lmasa — saqlangan tanlov.
 * Shunda Googlebot (localStorage'siz) har bir prefiksli URL'da
 * o'sha tildagi kontentni ko'radi.
 */
const savedLang = normalizeLang(readStoredLang());
const initialLang = urlLang ?? savedLang;

/**
 * Prefikssiz "/" ga kirgan RU/EN foydalanuvchisini o'z tilidagi URL'ga
 * yo'naltiramiz — shunda manzil satri, canonical va interfeys tili mos bo'ladi.
 * Shaxsiy/auth sahifalariga tegmaymiz (OAuth/email havolalari buzilmasin).
 */
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
    window.location.replace(target);
  }
}

// Eski build/localStorage'dagi '{count}' (bitta qavs) yozuvlar ham uchraydi —
// ularni to'g'rilab olamiz, aks holda ekranda "{count} ta" xom matn chiqadi.
function normalizeBraces(dict: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(dict)) {
    out[k] =
      typeof v === 'string'
        ? v.replace(/(?<!\{)\{([A-Za-z_][A-Za-z0-9_]*)\}(?!\})/g, '{{$1}}')
        : v;
  }
  return out;
}

let languageReady = false;

void i18n
  .use(initReactI18next)
  .init({
    resources: {
      uz: { translation: normalizeBraces(uz as Record<string, unknown>) },
      ru: { translation: normalizeBraces(ru as Record<string, unknown>) },
      en: { translation: normalizeBraces(en as Record<string, unknown>) },
    },
    lng: initialLang,
    fallbackLng: 'uz',
    // Resurslar inline — sinxron init, birinchi renderdayoq to'g'ri til.
    initImmediate: false,
    // Flat dot-notation keys (e.g. "home.greeting") — do NOT split on "."
    keySeparator: false,
    nsSeparator: false,
    interpolation: { escapeValue: false },
  })
  .then(() => {
    languageReady = true;
    document.documentElement.lang = HTML_LANG[normalizeLang(i18n.language)];
  });

document.documentElement.lang = HTML_LANG[normalizeLang(initialLang)];

i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = HTML_LANG[normalizeLang(lng)];
  // URL'dan kelgan tilni "foydalanuvchi tanlovi" sifatida saqlamaymiz.
  if (languageReady) {
    try {
      localStorage.setItem('boyxon-lang', normalizeLang(lng));
    } catch {
      // localStorage yozib bo'lmasa — til faqat shu sessiyada ishlaydi.
    }
  }
});

export default i18n;
