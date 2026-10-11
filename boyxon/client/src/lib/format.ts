import i18n from '../locales/i18n';

const LOCALE_MAP: Record<string, string> = {
  uz: 'uz-UZ',
  ru: 'ru-RU',
  en: 'en-US',
};

function currentLocale(): string {
  return LOCALE_MAP[i18n.language] ?? 'uz-UZ';
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

/** Order status i18n key — translate in components via t(`status.${status}`). */
export function orderStatusKey(status: string): string {
  return `status.${status}`;
}

