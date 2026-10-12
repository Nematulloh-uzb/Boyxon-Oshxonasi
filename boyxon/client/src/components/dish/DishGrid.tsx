import type { Dish } from '../../types';
import { useTranslation } from 'react-i18next';
import { DishCard } from './DishCard';
import { DishSkeleton } from '../ui/Skeleton';
import { UtensilsCrossed } from 'lucide-react';

interface Props {
  dishes?: Dish[];
  loading?: boolean;
  emptyText?: string;
}

export function DishGrid({ dishes, loading, emptyText }: Props) {
  const { t } = useTranslation();
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <DishSkeleton key={i} />
        ))}
      </div>
    );
  }
  if (!dishes?.length) {
    return (
      <div className="mx-auto max-w-sm px-6 py-14 text-center">
        <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-surface-raised">
          <UtensilsCrossed className="h-12 w-12 text-ink-300" />
        </div>
        <p className="mt-4 font-display text-lg font-bold text-ink-900">{t('home.no_dishes')}</p>
        <p className="mt-1 text-sm text-ink-300">{t('home.no_dishes_hint')}</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {dishes.map((d) => (
        <DishCard key={d._id} dish={d} />
      ))}
    </div>
  );
}
