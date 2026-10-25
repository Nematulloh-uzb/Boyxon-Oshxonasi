import { useState } from 'react';
import { Plus, Star, Timer } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { Dish } from '../../types';
import { formatPrice, localizedDishDescription, localizedDishName, tVal } from '../../lib/format';
import { useCart } from '../../hooks/useCart';
import { DishPlaceholder } from './DishPlaceholder';
import { Badge } from '../ui/Badge';

export function DishCard({ dish }: { dish: Dish }) {
  const { t, i18n } = useTranslation();
  const { add } = useCart();
  // URL ishlayotgan-deya xatolik (404/CORS) — singan rasm o'rniga placeholder.
  const [imgFailed, setImgFailed] = useState(false);
  const lang = i18n.language;
  const name = localizedDishName(dish, lang);
  const desc = localizedDishDescription(dish, lang);

  const addToCart = (): void => {
    add({ dishId: dish._id, name: dish.name, price: dish.price, image: dish.image }, 1);
    toast.success(tVal(t('dish.added'), { name }));
  };

  return (
    <article className="dish-contain card-hover-lift group overflow-hidden rounded-card border border-ink-line/60 bg-surface shadow-sm transition-all duration-300 hover:shadow-xl hover:border-primary-500/40">
      <Link to={`/dish/${dish.slug || dish._id}`} className="block overflow-hidden">
        {dish.image && !imgFailed ? (
          <img
            src={dish.image}
            alt={name}
            loading="lazy"
            decoding="async"
            width={640}
            height={480}
            onError={() => setImgFailed(true)}
            className="aspect-[4/3] w-full rounded-t-[20px] object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <DishPlaceholder />
        )}
      </Link>
      <div className="flex flex-col gap-2 p-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 font-display font-semibold text-ink-900 transition-colors group-hover:text-primary-600">{name}</h3>
          <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-ink-700">
            <Star className="h-3.5 w-3.5 fill-[#FDAB12] text-[#FDAB12] transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
            {dish.rating.toFixed(1)}
          </span>
        </div>
        <p className="line-clamp-2 text-sm text-ink-300">{desc}</p>
        <div className="flex items-center gap-3 text-xs text-ink-300">
          <span className="flex items-center gap-1">
            <Timer className="h-3.5 w-3.5" />
            {dish.deliveryTime} {t('dish.minutes')}
          </span>
          {dish.tags.includes('vegetarian') && <Badge tone="success">{t('dish.diet')}</Badge>}
          {dish.isFeatured && <Badge tone="promo">{t('dish.top')}</Badge>}
        </div>
        <div className="mt-1 flex items-center justify-between gap-2">
          <div>
            <p className="text-base font-bold text-ink-900">{formatPrice(dish.price)}</p>
            {dish.oldPrice ? (
              <p className="text-xs text-ink-300 line-through">{formatPrice(dish.oldPrice)}</p>
            ) : null}
          </div>
          <button
            onClick={addToCart}
            aria-label={t('dish.add')}
            className="grid h-10 w-10 place-items-center rounded-full bg-primary-600 text-white shadow-sm transition-all duration-200 hover:bg-primary-700 hover:scale-110 hover:shadow-glow active:scale-90"
          >
            <Plus className="h-5 w-5 transition-transform duration-200 group-hover/btn:rotate-90" />
          </button>
        </div>
      </div>
    </article>
  );
}
