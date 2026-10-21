import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { categoriesApi } from '../../api/categories.api';
import { dishesApi } from '../../api/dishes.api';
import { Breadcrumbs } from '../../components/seo/Breadcrumbs';
import { Seo } from '../../components/seo/Seo';
import { CategoryLinks } from '../../components/dish/CategoryLinks';
import { DishGrid } from '../../components/dish/DishGrid';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { QUERY_KEYS } from '../../lib/constants';
import {
  localizedCategoryName,
  localizedDishName,
} from '../../lib/format';
import { getCategorySeo } from '../../lib/category-seo';
import { breadcrumbSchema } from '../../lib/seo-schema';
import {
  absoluteUrl,
  canonicalFor,
  pathLang,
  SITE_URL,
  withLang,
} from '../../lib/seo';

/** /category/:slug — indekslanadigan kategoriya landing sahifasi. */
export default function CategoryPage(): JSX.Element {
  const { slug = '' } = useParams<{ slug: string }>();
  const { t, i18n } = useTranslation();
  const lang = pathLang();
  const path = `/category/${slug}`;
  const copy = getCategorySeo(slug, lang);

  const categoryQuery = useQuery({
    queryKey: [QUERY_KEYS.categories, 'detail', slug],
    queryFn: () => categoriesApi.detail(slug),
    enabled: Boolean(slug),
  });

  const dishesQuery = useQuery({
    queryKey: [QUERY_KEYS.dishes, 'category-page', slug],
    queryFn: () => dishesApi.list({ category: slug, limit: 100, sort: 'popular' }),
    enabled: Boolean(slug),
  });

  const categoriesQuery = useQuery({
    queryKey: [QUERY_KEYS.categories],
    queryFn: () => categoriesApi.list().then((r) => r.data),
    staleTime: 10 * 60 * 1000,
  });

  const category = categoryQuery.data?.data;
  const name = category ? localizedCategoryName(category, i18n.language) : slug;
  const dishes = dishesQuery.data?.data ?? [];

  if (categoryQuery.isLoading) {
    return (
      <>
        <Seo
          title={copy?.title ?? `${t('common.loading')} — Boyxon Oshxonasi`}
          description={copy?.description ?? t('seo.home.description')}
          path={path}
        />
        <div className="mx-auto max-w-6xl space-y-5 px-4 py-5">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-9 w-2/3" />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/3] w-full" />
            ))}
          </div>
        </div>
      </>
    );
  }

  if (categoryQuery.isError || !category) {
    return (
      <>
        <Seo
          title={`${t('pages.404.title')} — Boyxon Oshxonasi`}
          description={t('seo.notfound.description')}
          path={path}
          noindex
        />
        <div className="mx-auto max-w-3xl px-4 py-20 text-center">
          <h1 className="font-display text-2xl font-extrabold text-ink-900">
            {t('pages.404.title')}
          </h1>
          <p className="mt-2 text-ink-300">{t('pages.404.desc')}</p>
          <Link to="/" className="mt-4 inline-block">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4" /> {t('seo.category.back')}
            </Button>
          </Link>
        </div>
      </>
    );
  }

  const title = copy?.title ?? t('seo.category.title', { name });
  const description = copy?.description ?? t('seo.category.description', { name });
  const crumb = copy?.crumb ?? name;

  const listedDishes = dishes.slice(0, 24);
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: title,
      description,
      url: canonicalFor(path, lang),
      inLanguage: lang,
      isPartOf: {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        name: 'Boyxon Oshxonasi',
        url: absoluteUrl(withLang('/', lang)),
      },
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: listedDishes.length,
        itemListElement: listedDishes.map((dish, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: localizedDishName(dish, i18n.language),
          url: absoluteUrl(withLang(`/dish/${dish.slug || dish._id}`, lang)),
        })),
      },
    },
    breadcrumbSchema(lang, [
      { name: t('seo.breadcrumb_home'), path: '/' },
      { name: crumb, path },
    ]),
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-5">
      <Seo
        title={title}
        description={description}
        path={path}
        keywords={copy?.keywords ?? t('seo.category.keywords', { name })}
        jsonLd={jsonLd}
      />

      <Breadcrumbs
        items={[
          { label: t('seo.breadcrumb_home'), to: '/' },
          { label: crumb },
        ]}
      />

      <header className="mb-5 mt-3 max-w-3xl">
        <h1 className="font-display text-2xl font-extrabold text-ink-900">
          {copy?.h1 ?? t('seo.category.h1', { name })}
        </h1>
        <p className="mt-2 text-[15px] leading-relaxed text-ink-500">
          {copy?.subtitle ?? t('seo.category.subtitle', { name })}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-ink-300">
          {copy?.content ?? t('seo.category.content', { name })}
        </p>
      </header>

      <DishGrid
        dishes={dishes}
        loading={dishesQuery.isLoading || dishesQuery.isFetching}
        emptyText={t('seo.category.empty')}
      />

      <section className="mt-10">
        <h2 className="mb-3 font-display text-lg font-bold">{t('seo.home.categories_title')}</h2>
        <CategoryLinks categories={categoriesQuery.data ?? []} activeSlug={slug} />
      </section>

      <div className="mt-8">
        <Link to="/">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4" /> {t('seo.category.back')}
          </Button>
        </Link>
      </div>
    </div>
  );
}
