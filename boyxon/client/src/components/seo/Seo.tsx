import { useSeo, type SeoOptions } from '../../hooks/useSeo';
import { pathLang } from '../../lib/seo';

/**
 * Sahifa uchun SEO meta ma'lumotlarini o'rnatadi.
 * Hech qanday ko'rinadigan DOM chiqarmaydi.
 */
export function Seo(props: Omit<SeoOptions, 'lang'>): null {
  const lang = pathLang();
  useSeo({ ...props, lang });
  return null;
}
