import { useEffect } from 'react';
import {
  absoluteUrl,
  canonicalFor,
  OG_LOCALE,
  SEO_LANGS,
  type SeoLang,
} from '../lib/seo';

export interface SeoJsonLd {
  [key: string]: unknown;
}

export interface SeoOptions {
  title: string;
  description: string;
  /** Til prefiksisiz app path: "/", "/dish/palov", "/category/palov". */
  path: string;
  /** Nisbiy yoki absolyut rasm URL'i. Bo'sh bo'lsa /og-image.png ishlatiladi. */
  image?: string;
  type?: 'website' | 'article' | 'product';
  noindex?: boolean;
  keywords?: string;
  lang: SeoLang;
  jsonLd?: SeoJsonLd | SeoJsonLd[];
}

const MARK = 'data-boyxon-seo';
const ROBOTS_INDEX = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
const ROBOTS_NOINDEX = 'noindex, nofollow';

function removeMeta(attr: 'name' | 'property', key: string): void {
  document.head.querySelectorAll(`meta[${attr}="${key}"]`).forEach((el) => el.remove());
}

function setMeta(attr: 'name' | 'property', key: string, content: string | undefined): void {
  if (!content) {
    removeMeta(attr, key);
    return;
  }
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
  el.setAttribute(MARK, 'true');
}

function setMetaList(attr: 'name' | 'property', key: string, values: string[]): void {
  removeMeta(attr, key);
  for (const value of values) {
    const el = document.createElement('meta');
    el.setAttribute(attr, key);
    el.setAttribute('content', value);
    el.setAttribute(MARK, 'true');
    document.head.appendChild(el);
  }
}

function setLink(rel: string, href: string, hreflang?: string): void {
  const selector = hreflang
    ? `link[rel="${rel}"][hreflang="${hreflang}"]`
    : `link[rel="${rel}"]`;
  let el = document.head.querySelector<HTMLLinkElement>(selector);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    if (hreflang) el.setAttribute('hreflang', hreflang);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
  el.setAttribute(MARK, 'true');
}

function resolveImage(image?: string): string {
  if (!image) return absoluteUrl('/og-image.png');
  return /^https?:\/\//i.test(image) ? image : absoluteUrl(image);
}

/**
 * Sahifa <head> ini boshqaradi: title, description, canonical, hreflang,
 * Open Graph, Twitter Card va JSON-LD.
 *
 * react-helmet o'rniga yengil hook ishlatiladi — index.html dagi statik
 * meta taglar bilan dublikat yaratmaslik uchun mavjud taglar yangilanadi.
 */
export function useSeo(options: SeoOptions): void {
  const {
    title,
    description,
    path,
    image,
    type = 'website',
    noindex = false,
    keywords,
    lang,
    jsonLd,
  } = options;

  // Effekt dependency'si uchun barqaror satr (obyekt har renderda yangi bo'ladi).
  const json = jsonLd ? JSON.stringify(jsonLd) : '';

  useEffect(() => {
    // Avvalgi renderdan qolgan barcha SEO taglarini tozalaymiz.
    document.head.querySelectorAll(`[${MARK}]`).forEach((el) => el.remove());

    document.documentElement.dir = 'ltr';
    document.title = title;

    const canonical = canonicalFor(path, lang);
    const imageUrl = resolveImage(image);

    setMeta('name', 'description', description);
    setMeta('name', 'robots', noindex ? ROBOTS_NOINDEX : ROBOTS_INDEX);
    if (keywords) setMeta('name', 'keywords', keywords);

    if (noindex) {
      // noindex sahifalarda canonical/hreflang qarama-qarshi signal bermasin.
      document.head
        .querySelectorAll('link[rel="canonical"], link[rel="alternate"][hreflang]')
        .forEach((el) => el.remove());
    } else {
      setLink('canonical', canonical);
      for (const l of SEO_LANGS) setLink('alternate', canonicalFor(path, l), l);
      setLink('alternate', canonicalFor(path, 'uz'), 'x-default');
    }

    setMeta('property', 'og:type', type);
    setMeta('property', 'og:site_name', 'Boyxon Oshxonasi');
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:url', canonical);
    setMeta('property', 'og:image', imageUrl);
    setMeta('property', 'og:image:alt', title);
    setMeta('property', 'og:locale', OG_LOCALE[lang]);
    setMetaList(
      'property',
      'og:locale:alternate',
      SEO_LANGS.filter((l) => l !== lang).map((l) => OG_LOCALE[l]),
    );

    if (!image) {
      setMeta('property', 'og:image:width', '1200');
      setMeta('property', 'og:image:height', '630');
      setMeta('property', 'og:image:type', 'image/png');
    } else {
      removeMeta('property', 'og:image:width');
      removeMeta('property', 'og:image:height');
      removeMeta('property', 'og:image:type');
    }

    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image', imageUrl);
    setMeta('name', 'twitter:image:alt', title);

    const googleVerification = import.meta.env.VITE_GOOGLE_SITE_VERIFICATION as string | undefined;
    const yandexVerification = import.meta.env.VITE_YANDEX_VERIFICATION as string | undefined;
    if (googleVerification) setMeta('name', 'google-site-verification', googleVerification);
    if (yandexVerification) setMeta('name', 'yandex-verification', yandexVerification);

    if (json) {
      const parsed = JSON.parse(json) as SeoJsonLd | SeoJsonLd[];
      const items = Array.isArray(parsed) ? parsed : [parsed];
      for (const item of items) {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.setAttribute(MARK, 'jsonld');
        script.textContent = JSON.stringify(item).replace(/</g, '\\u003c');
        document.head.appendChild(script);
      }
    }

    return () => {
      document.head.querySelectorAll(`[${MARK}]`).forEach((el) => el.remove());
    };
  }, [title, description, path, image, type, noindex, keywords, lang, json]);
}
