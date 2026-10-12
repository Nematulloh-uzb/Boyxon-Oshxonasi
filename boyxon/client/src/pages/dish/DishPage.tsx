import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Star, Timer } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { dishesApi } from '../../api/dishes.api';
import { useCart } from '../../hooks/useCart';
import { formatPrice, localizedDishName, localizedDishDescription, tVal } from '../../lib/format';
import { QUERY_KEYS } from '../../lib/constants';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { DishPlaceholder } from '../../components/dish/DishPlaceholder';
import { Skeleton } from '../../components/ui/Skeleton';
import type { Dish } from '../../types';

interface Review {
  _id: string;
  rating: number;
  comment?: string;
  user?: { _id: string; name: string; avatar?: string | null };
}

/**
 * GET /dish/:slug — bitta taom sahifasi.
 * DishCard shu yerga link qiladi (slug yoki _id).
 */
export default function DishPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const { t, i18n } = useTranslation();
  const { add } = useCart();

  const { data, isLoading, isError } = useQuery({
    queryKey: [QUERY_KEYS.dishes, 'detail', slug],
    queryFn: () => dishesApi.detail(slug),
    enabled: Boolean(slug),
  });

  const dish: Dish | undefined = data?.data?.dish;
  const reviews: Review[] = (data?.data?.reviews as Review[] | undefined) ?? [];
  const lang = i18n.language;

  const addToCart = (): void => {
    if (!dish) return;
    add({ dishId: dish._id, name: dish.name, price: dish.price, image: dish.image }, 1);
    toast.success(tVal(t('dish.added'), { name: localizedDishName(dish, lang) }));
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-5">
        <Skeleton className="aspect-[16/9] w-full" />
        <Skeleton className="h-7 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    );
  }

  if (isError || !dish) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <p className="text-ink-300">{t('dish.not_found')}</p>
        <Link to="/" className="mt-4 inline-block">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4" /> {t('dish.back_to_menu')}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5 px-4 py-5">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-primary-600">
        <ArrowLeft className="h-4 w-4" /> {t('dish.back_to_menu')}
      </Link>

      <div className="overflow-hidden rounded-card border border-ink-line/60 bg-surface shadow-sm">
        {dish.image ? (
          <img src={dish.image} alt={localizedDishName(dish, lang)} className="aspect-[16/9] w-full object-cover" />
        ) : (
          <DishPlaceholder className="rounded-none" />
        )}

        <div className="space-y-4 p-5">
          <div className="flex items-start justify-between gap-3">
            <h1 className="font-display text-2xl font-extrabold text-ink-900">
              {localizedDishName(dish, lang)}
            </h1>
            <span className="flex shrink-0 items-center gap-1 text-sm font-semibold text-ink-700">
              <Star className="h-4 w-4 fill-[#FDAB12] text-[#FDAB12]" />
              {dish.rating.toFixed(1)}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-ink-300">
            <span className="flex items-center gap-1">
              <Timer className="h-3.5 w-3.5" />
              {dish.deliveryTime} {t('dish.minutes')}
            </span>
            {typeof dish.calories === 'number' && dish.calories > 0 && (
              <span>{tVal(t('dish.calories'), { count: dish.calories })}</span>
            )}
            {dish.tags.includes('vegetarian') && <Badge tone="success">{t('dish.vegetarian')}</Badge>}
            {dish.tags.includes('spicy') && <Badge tone="danger">{t('dish.spicy')}</Badge>}
            {dish.isFeatured && <Badge tone="promo">{t('dish.top')}</Badge>}
          </div>

          <div>
            <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-ink-300">
              {t('dish.description')}
            </h2>
            <p className="text-[15px] leading-relaxed text-ink-700">
              {localizedDishDescription(dish, lang)}
            </p>
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-ink-line pt-4">
            <div>
              <p className="font-display text-2xl font-bold text-primary-600">{formatPrice(dish.price)}</p>
              {dish.oldPrice ? (
                <p className="text-sm text-ink-300 line-through">{formatPrice(dish.oldPrice)}</p>
              ) : null}
            </div>
            <Button size="lg" onClick={addToCart}>
              {t('dish.add_to_cart')}
            </Button>
          </div>
        </div>
      </div>

      <DishReviews reviews={reviews} reviewCount={dish.reviewCount} />
    </div>
  );
}

/** Sharhlar bo'limi — alohida komponent, asosiy sahifa soddaroq bo'lsin. */
function DishReviews({ reviews, reviewCount }: { reviews: Review[]; reviewCount: number }) {
  const { t } = useTranslation();
  return (
    <section>
      <h2 className="mb-2 font-display text-lg font-bold">
        {t('dish.reviews')}{' '}
        <span className="text-sm font-normal text-ink-300">
          {tVal(t('dish.reviews_count'), { count: reviewCount })}
        </span>
      </h2>
      {reviews.length ? (
        <div className="space-y-2">
          {reviews.map((r) => (
            <Card key={r._id} className="p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold text-ink-900">{r.user?.name ?? '—'}</p>
                <span className="flex items-center gap-1 text-xs font-semibold text-ink-700">
                  <Star className="h-3.5 w-3.5 fill-[#FDAB12] text-[#FDAB12]" />
                  {r.rating}
                </span>
              </div>
              {r.comment ? <p className="mt-1 text-sm text-ink-500">{r.comment}</p> : null}
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-6 text-center text-sm text-ink-300">{t('dish.no_reviews')}</Card>
      )}
    </section>
  );
}
