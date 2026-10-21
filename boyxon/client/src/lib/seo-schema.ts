import { absoluteUrl, withLang, type SeoLang } from './seo';

export interface BreadcrumbSchemaItem {
  name: string;
  path: string;
}

/** BreadcrumbList JSON-LD (Google rich results uchun). */
export function breadcrumbSchema(
  lang: SeoLang,
  items: BreadcrumbSchemaItem[],
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(withLang(item.path, lang)),
    })),
  };
}
