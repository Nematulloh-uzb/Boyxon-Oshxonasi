import i18n from '../locales/i18n';
import { normalizeLang } from './seo';

const LOCALE_MAP: Record<string, string> = {
  uz: 'uz-UZ',
  ru: 'ru-RU',
  en: 'en-US',
};

function currentLocale(): string {
  return LOCALE_MAP[i18n.language ?? 'uz'] ?? 'uz-UZ';
}

/**
 * 45000 -> "45 000 UZS" (currency comes from locale key "common.currency").
 * uz-UZ uchun Intl ba'zi brauzerlarda vergul bilan formatlaydi ("45,000") —
 * dizayn talabi bo'yicha bo'shliqli guruhlashga keltiramiz.
 */
export function formatPrice(value: number): string {
  const n = Math.round(value);
  const lang = normalizeLang(i18n.language);
  const formatted = new Intl.NumberFormat(currentLocale()).format(n);
  const grouped = lang === 'uz' ? formatted.replace(/,/g, ' ') : formatted;
  // i18n hali yuklanmagan yoki kalit o'chgan bo'lsa — bo'sh joy qolmasin.
  const currency = i18n.t('common.currency') || "so'm";
  return `${grouped} ${currency}`;
}

/**
 * ISO sana -> "9 okt, 14:30".
 * `toLocaleString('uz-UZ', { month: 'short' })` Chrome'da "M10" kabi
 * ma'nosiz qiymat qaytaradi — shuning uchun oy nomlari qo'lda.
 */
const MONTHS_SHORT: Record<Lang, string[]> = {
  uz: ['yan', 'fev', 'mar', 'apr', 'may', 'iyun', 'iyul', 'avg', 'sen', 'okt', 'noy', 'dek'],
  ru: ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
};

export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const lang = normalizeLang(i18n.language);
  const month = MONTHS_SHORT[lang][d.getMonth()];
  const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  return lang === 'en'
    ? `${month} ${d.getDate()}, ${time}`
    : `${d.getDate()} ${month}, ${time}`;
}

/** DB dagi ko'p tilli matnni joriy tilga moslab qaytaradi (fallback: uz). */
export type Lang = 'uz' | 'ru' | 'en';

export function localizedText(
  uz: string,
  ru: string | undefined,
  en: string | undefined,
  lang: string | undefined,
): string {
  const normalized = normalizeLang(lang);
  if (normalized === 'ru' && ru?.trim()) return ru;
  if (normalized === 'en' && en?.trim()) return en;
  return uz;
}

export function localizedDishName(dish: { name: string; nameRu?: string; nameEn?: string }, lang: string | undefined): string {
  return localizedText(dish.name, dish.nameRu, dish.nameEn, lang);
}

export function localizedDishDescription(
  dish: { description: string; descriptionRu?: string; descriptionEn?: string },
  lang: string | undefined,
): string {
  return localizedText(dish.description, dish.descriptionRu, dish.descriptionEn, lang);
}

const CATEGORY_NAME_FALLBACKS: Record<string, Partial<Record<Lang, string>>> = {
  taomlar: { ru: 'Блюда', en: 'Dishes' },
  shorvalar: { ru: 'Супы', en: 'Soups' },
  palovlar: { ru: 'Плов', en: 'Pilaf' },
  somsa: { ru: 'Самса', en: 'Samsa' },
  kaboblar: { ru: 'Шашлык', en: 'Kebabs' },
  salatlar: { ru: 'Салаты', en: 'Salads' },
  shirinliklar: { ru: 'Десерты', en: 'Desserts' },
  ichimliklar: { ru: 'Напитки', en: 'Drinks' },
  non: { ru: 'Хлеб', en: 'Bread' },
};

export function localizedCategoryName(
  cat: { name: string; nameRu?: string; nameEn?: string; slug?: string },
  lang: string | undefined,
): string {
  const normalized = normalizeLang(lang);
  const explicit = localizedText(cat.name, cat.nameRu, cat.nameEn, lang);
  if (explicit !== cat.name) return explicit;
  // DB'da tarjima bo'lmasa, mavjud kategoriya uchun qisqa nomdan foydalanamiz.
  if (cat.slug) {
    const fallback = CATEGORY_NAME_FALLBACKS[cat.slug]?.[normalized];
    if (fallback) return fallback;
  }
  return cat.name;
}

/** Order status i18n key — translate in components via t(`status.${status}`). */
export function orderStatusKey(status: string): string {
  return `status.${status}`;
}

/**
 * Xavfsiz interpolatsiya: i18next qiymat qo'ymay qoldirgan bo'lsa ham
 * ("{count} ta" / "{{count}} ta" xom matn ko'rinmasligi uchun) o'zimiz to'ldiramiz.
 * Eski bundle/kesh bilan ham ekranda chiroyli son chiqadi.
 */
export function tVal(template: string, values: Record<string, string | number>): string {
  let out = template;
  for (const [k, v] of Object.entries(values)) {
    out = out.split(`{{${k}}}`).join(String(v)).split(`{${k}}`).join(String(v));
  }
  return out;
}

