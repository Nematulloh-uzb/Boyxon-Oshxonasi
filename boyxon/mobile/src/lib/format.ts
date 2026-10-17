import i18n from '../i18n';

const MONTHS: Record<Lang, string[]> = {
  uz: ['yan', 'fev', 'mar', 'apr', 'may', 'iyn', 'iyl', 'avg', 'sen', 'okt', 'noy', 'dek'],
  ru: ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
};

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

/** Hermes Intl bo'lmasa ham ishlaydigan zaxira: 45000 -> "45 000" */
function groupThousands(n: number): string {
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

/** 45000 -> "45 000 so'm" (valyuta "common.currency" kalitidan; dizayndagidek bo'shliqli guruhlash) */
export function formatPrice(value: number): string {
  const currency = i18n.t('common.currency') || "so'm";
  return `${groupThousands(value)} ${currency}`;
}

/** ISO sana -> "9 okt, 14:30" (Hermes Intl'ga bog'lanmagan; uz/ru/en oylar) */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const months = MONTHS[(i18n.language as Lang) ?? 'uz'] ?? MONTHS.uz;
  return `${d.getDate()} ${months[d.getMonth()]}, ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

/** Faqat vaqt: "14:30" */
export function formatTime(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

export type Lang = 'uz' | 'ru' | 'en';

/** DB dagi ko'p tilli matnni joriy tilga moslab qaytaradi (fallback: uz). */
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

export function localizedDishName(
  dish: { name: string; nameRu?: string; nameEn?: string },
  lang: string | undefined,
): string {
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

/** Order status i18n key — komponentlarda t(`status.${status}`) orqali tarjima qilinadi. */
export function orderStatusKey(status: string): string {
  return `status.${status}`;
}

/** Xavfsiz interpolatsiya (i18next qiymat qo'ymagan bo'lsa ham xom "{{count}}" ko'rinmasin). */
export function tVal(template: string, values: Record<string, string | number>): string {
  let out = template;
  for (const [k, v] of Object.entries(values)) {
    out = out.split(`{{${k}}}`).join(String(v)).split(`{${k}}`).join(String(v));
  }
  return out;
}
