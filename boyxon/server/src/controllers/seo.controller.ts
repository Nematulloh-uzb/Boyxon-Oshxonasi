import type { Request, Response } from 'express';
import { primaryClientUrl } from '../config/env';
import { Category } from '../models/Category.model';
import { Dish } from '../models/Dish.model';
import { asyncHandler } from '../utils/asyncHandler';

const LANGS = ['uz', 'ru', 'en'] as const;
type Lang = (typeof LANGS)[number];

const XML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;',
};

function escapeXml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => XML_ESCAPES[char] ?? char);
}

/** uz — prefikssiz, ru/en — /ru, /en prefiksi bilan. */
function localizedPath(path: string, lang: Lang): string {
  if (lang === 'uz') return path;
  return path === '/' ? `/${lang}` : `/${lang}${path}`;
}

function isoDate(value: unknown): string {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString();
  return new Date().toISOString();
}

function absoluteAsset(req: Request, image: string | null | undefined): string | null {
  if (!image) return null;
  if (/^https?:\/\//i.test(image)) return image;
  if (image.startsWith('//')) return `https:${image}`;
  const base = `${req.protocol}://${req.get('host') ?? 'localhost'}`;
  return `${base}${image.startsWith('/') ? image : `/${image}`}`;
}

/**
 * GET /sitemap.xml
 *
 * Har bir ommaviy sahifa uchun uchta til URL'i + hreflang alternativlari.
 * Taom rasmlari image sitemap kengaytmasi orqali qo'shiladi.
 */
export const sitemap = asyncHandler(async (req: Request, res: Response) => {
  const base = primaryClientUrl();

  const [categories, dishes] = (await Promise.all([
    Category.find({ isActive: true })
      .select('slug updatedAt')
      .sort({ order: 1, name: 1 })
      .lean(),
    Dish.find({ isActive: true })
      .select('slug image updatedAt')
      .sort({ updatedAt: -1 })
      .lean(),
  ])) as [
    Array<{ slug: string; updatedAt?: Date }>,
    Array<{ _id: unknown; slug?: string; image?: string | null; updatedAt?: Date }>,
  ];

  const entries: string[] = [];

  const addUrl = (path: string, options: {
    lastmod: string;
    changefreq: string;
    priority: string;
    image?: string | null;
  }): void => {
    const alternates = LANGS.map(
      (lang) =>
        `<xhtml:link rel="alternate" hreflang="${lang}" href="${escapeXml(
          encodeURI(base + localizedPath(path, lang)),
        )}" />`,
    ).join('');
    const xDefault = `<xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(
      encodeURI(base + localizedPath(path, 'uz')),
    )}" />`;
    const image = options.image
      ? `<image:image><image:loc>${escapeXml(encodeURI(options.image))}</image:loc></image:image>`
      : '';

    for (const lang of LANGS) {
      entries.push(
        [
          '<url>',
          `<loc>${escapeXml(encodeURI(base + localizedPath(path, lang)))}</loc>`,
          `<lastmod>${options.lastmod}</lastmod>`,
          `<changefreq>${options.changefreq}</changefreq>`,
          `<priority>${options.priority}</priority>`,
          alternates,
          xDefault,
          image,
          '</url>',
        ].join(''),
      );
    }
  };

  const updateDates = [...categories, ...dishes]
    .map((item) => item.updatedAt)
    .filter((date): date is Date => date instanceof Date && !Number.isNaN(date.getTime()));
  const homeLastmod = updateDates.length
    ? new Date(Math.max(...updateDates.map((date) => date.getTime()))).toISOString()
    : new Date().toISOString();

  addUrl('/', {
    lastmod: homeLastmod,
    changefreq: 'daily',
    priority: '1.0',
  });

  for (const category of categories) {
    addUrl(`/category/${category.slug}`, {
      lastmod: isoDate(category.updatedAt),
      changefreq: 'weekly',
      priority: '0.8',
    });
  }

  for (const dish of dishes) {
    const slug = dish.slug || String(dish._id);
    addUrl(`/dish/${slug}`, {
      lastmod: isoDate(dish.updatedAt),
      changefreq: 'weekly',
      priority: '0.7',
      image: absoluteAsset(req, dish.image),
    });
  }

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"',
    '        xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...entries,
    '</urlset>',
    '',
  ].join('\n');

  res.set('Content-Type', 'application/xml; charset=utf-8');
  res.set('Cache-Control', 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400');
  res.send(xml);
});

/** GET /robots.txt — API domenida faqat sitemap ochiq. */
export function apiRobots(_req: Request, res: Response): void {
  res
    .set('Content-Type', 'text/plain; charset=utf-8')
    .send(
      [
        '# Boyxon Oshxonasi API',
        'User-agent: *',
        'Disallow: /api/',
        'Allow: /sitemap.xml',
        '',
      ].join('\n'),
    );
}
