import type { Dish } from '../../types';
import { DishCard } from './DishCard';
import { DishSkeleton } from '../ui/Skeleton';
import { UtensilsCrossed } from 'lucide-react';

interface Props {
  dishes?: Dish[];
  loading?: boolean;
  emptyText?: string;
}

export function DishGrid({ dishes, loading, emptyText = 'Taom topilmadi' }: Props) {
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
      <div className="py-14 text-center">
        <UtensilsCrossed className="mx-auto h-12 w-12 text-ink-300" />
        <p className="mt-3 text-ink-300">{emptyText}</p>
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
