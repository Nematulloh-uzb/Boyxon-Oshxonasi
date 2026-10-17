import i18n from '../i18n';

const LOCALE_MAP: Record<string, string> = {
  uz: 'uz-UZ',
  ru: 'ru-RU',
  en: 'en-US',
};

function currentLocale(): string {
  return LOCALE_MAP[i18n.language ?? 'uz'] ?? 'uz-UZ';
}

/** Hermes Intl bo'lmasa ham ishlaydigan zaxira: 45000 -> "45 000" */
function groupThousands(n: number): string {
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

/** 45000 -> "45 000 so'm" (valyuta "common.currency" kalitidan) */
export function formatPrice(value: number): string {
  const n = Math.round(value);
  let formatted: string;
  try {
    formatted = new Intl.NumberFormat(currentLocale()).format(n);
    // Ba'zi Hermes build'lari uz-UZ'ni bilmaydi — natija bo'sh/noto'g'ri bo'lsa zaxira.
    if (!formatted || !/\d/.test(formatted)) formatted = groupThousands(n);
  } catch {
    formatted = groupThousands(n);
  }
  const currency = i18n.t('common.currency') || "so'm";
  return `${formatted} ${currency}`;
}

/** ISO sana -> "9 okt, 14:30" (locale-aware) */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  try {
    return d.toLocaleString(currentLocale(), {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return d.toLocaleString();
  }
}

/** Faqat vaqt: "14:30" */
export function formatTime(iso: string): string {
  const d = new Date(iso);
  try {
    return d.toLocaleTimeString(currentLocale(), { hour: '2-digit', minute: '2-digit' });
  } catch {
    return d.toLocaleTimeString();
  }
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
