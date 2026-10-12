import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { dishesApi, type DishFilters } from '../../api/dishes.api';
import { categoriesApi } from '../../api/categories.api';
import { CategoryChips } from '../../components/dish/CategoryChips';
import { DishGrid } from '../../components/dish/DishGrid';
import { DishCard } from '../../components/dish/DishCard';
import { DishFilterSheet, type DishFilterValues } from '../../components/dish/DishFilterSheet';
import { useDebounce } from '../../hooks/useDebounce';
import { useCartStore } from '../../store/cart.store';
import { DELIVERY_FEE, FREE_DELIVERY_FROM, QUERY_KEYS } from '../../lib/constants';
import { formatPrice, tVal } from '../../lib/format';

export default function HomePage() {
  const { t } = useTranslation();
  const cartSubtotal = useCartStore((s) => s.lines.reduce((a, l) => a + l.price * l.quantity, 0));
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string | undefined>();
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<DishFilterValues>({});
  const [page, setPage] = useState(1);
  const debounced = useDebounce(search, 400);

  const { data: cats, isLoading: catsLoading } = useQuery({
    queryKey: [QUERY_KEYS.categories],
    queryFn: () => categoriesApi.list().then((r) => r.data),
    staleTime: 10 * 60 * 1000,
  });

  const params: DishFilters = useMemo(
    () => ({
      category,
      search: debounced || undefined,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      rating: filters.rating,
      tags: filters.tags,
      sort: filters.sort,
      page,
      limit: 12,
    }),
    [category, debounced, filters, page],
  );

  const { data, isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: [QUERY_KEYS.dishes, params],
    queryFn: () => dishesApi.list(params),
  });

  const { data: featured, isLoading: featLoading } = useQuery({
    queryKey: [QUERY_KEYS.featured],
    queryFn: () => dishesApi.featured().then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });

  const setCat = (slug?: string): void => {
    setCategory(slug);
    setPage(1);
  };
  const applyFilters = (v: DishFilterValues): void => {
    setFilters(v);
    setPage(1);
  };

  const pages = data?.pagination.pages ?? 1;

  return (
    <div className="mx-auto max-w-6xl px-4 py-5">
      {/* Salom + qidiruv */}
      <div className="mb-4">
        <p className="text-sm text-ink-300">{t('home.greeting')} 👋</p>
        <h1 className="font-display text-2xl font-extrabold text-ink-900">{t('home.title')}</h1>
      </div>

      <div className="mb-5 flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-300" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder={t('home.search_placeholder')}
            className="h-12 w-full rounded-full border border-ink-line bg-surface pl-11 pr-4 text-[15px] outline-none focus:border-primary-500"
          />
        </div>
        <button
          onClick={() => setFilterOpen(true)}
          className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-ink-line bg-surface text-ink-700"
          aria-label={t('filter.title')}
        >
          <SlidersHorizontal className="h-5 w-5" />
        </button>
      </div>

      {/* Hero banner: "bepul" emas — mijozning cho'ntagida qoladigan pul */}
      <div className="mb-6 overflow-hidden rounded-card bg-gradient-to-r from-primary-500 to-primary-700 p-6 text-white">
        <p className="text-sm font-semibold text-white/80">{t('home.new_season')}</p>
        <p className="font-display text-2xl font-extrabold">{t('home.promo_title')}</p>
        <p className="mt-1 text-sm text-white/80">{t('home.promo_code')}</p>
        <div className="mt-4">
          {cartSubtotal >= FREE_DELIVERY_FROM ? (
            <p className="text-sm font-semibold text-white">{tVal(t('home.promo_unlocked'), { fee: formatPrice(DELIVERY_FEE) })}</p>
          ) : (
            <>
              <p className="text-sm font-semibold text-white/90">
                {tVal(t('home.promo_progress'), {
                  amount: formatPrice(cartSubtotal === 0 ? FREE_DELIVERY_FROM : FREE_DELIVERY_FROM - cartSubtotal),
                  fee: formatPrice(DELIVERY_FEE),
                })}
              </p>
              {cartSubtotal > 0 && (
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/25">
                  <div
                    className="h-full rounded-full bg-white transition-all"
                    style={{ width: `${Math.min(100, Math.round((cartSubtotal / FREE_DELIVERY_FROM) * 100))}%` }}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Kategoriyalar */}
      <div className="mb-6">
        {cats ? (
          <CategoryChips categories={cats} active={category} onChange={setCat} />
        ) : catsLoading ? (
          <div className="flex gap-2">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-9 w-24 animate-pulse rounded-full bg-muted-2" />)}</div>
        ) : null}
      </div>

      {/* Mashhur taomlar (gorizontal) */}
      {featured && featured.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 font-display text-lg font-bold">{t('home.featured')}</h2>
          <div className="no-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:px-0">
            {featured.map((d) => (
              <div key={d._id} className="w-64 shrink-0 md:w-72">
                <DishCard dish={d} />
              </div>
            ))}
          </div>
        </section>
      )}
      {featLoading && (
        <div className="mb-8 flex gap-4">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-72 w-64 shrink-0 animate-pulse rounded-card bg-muted-2" />)}
        </div>
      )}

      {/* Barcha taomlar */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">{t('home.all_dishes')}</h2>
          <span className="shrink-0 text-sm text-ink-300">{tVal(t('home.items_count'), { count: data?.pagination.total ?? 0 })}</span>
        </div>

        {isError ? (
          <div className="rounded-card bg-danger/10 p-6 text-center">
            <p className="text-sm text-danger">{t('home.load_error')}</p>
            <button onClick={() => void refetch()} className="mt-2 text-sm font-semibold text-primary-600">
              {t('common.retry')}
            </button>
          </div>
        ) : (
          <DishGrid dishes={data?.data} loading={isLoading || isFetching} />
        )}

        {pages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="h-10 rounded-full border border-ink-line px-4 text-sm disabled:opacity-40"
            >
              ← {t('common.prev')}
            </button>
            <span className="px-2 text-sm text-ink-300">{page} / {pages}</span>
            <button
              disabled={page >= pages}
              onClick={() => setPage((p) => p + 1)}
              className="h-10 rounded-full border border-ink-line px-4 text-sm disabled:opacity-40"
            >
              {t('common.next')} →
            </button>
          </div>
        )}
      </section>

      <DishFilterSheet open={filterOpen} onClose={() => setFilterOpen(false)} value={filters} onApply={applyFilters} />
    </div>
  );
}

