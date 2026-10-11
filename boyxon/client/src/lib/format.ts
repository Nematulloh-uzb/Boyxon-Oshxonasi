import i18n from '../locales/i18n';

const LOCALE_MAP: Record<string, string> = {
  uz: 'uz-UZ',
  ru: 'ru-RU',
  en: 'en-US',
};

function currentLocale(): string {
  return LOCALE_MAP[i18n.language ?? 'uz'] ?? 'uz-UZ';
}

/** 45000 -> "45 000 so'm" (currency comes from locale key "common.currency") */
export function formatPrice(value: number): string {
  const n = Math.round(value);
  const formatted = new Intl.NumberFormat(currentLocale()).format(n);
  return `${formatted} ${i18n.t('common.currency')}`;
}

/** ISO sana -> "9 okt, 14:30" (locale-aware) */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(currentLocale(), { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

/** DB dagi ko'p tilli matnni joriy tilga moslab qaytaradi (fallback: uz). */
export type Lang = 'uz' | 'ru' | 'en';

export function localizedText(
  uz: string,
  ru: string | undefined,
  en: string | undefined,
  lang: string | undefined,
): string {
  if (lang === 'ru' && ru?.trim()) return ru;
  if (lang === 'en' && en?.trim()) return en;
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

export function localizedCategoryName(
  cat: { name: string; nameRu?: string; nameEn?: string },
  lang: string | undefined,
): string {
  return localizedText(cat.name, cat.nameRu, cat.nameEn, lang);
}

/** Order status i18n key — translate in components via t(`status.${status}`). */
export function orderStatusKey(status: string): string {
  return `status.${status}`;
}

