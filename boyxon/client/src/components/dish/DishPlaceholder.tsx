import { UtensilsCrossed } from 'lucide-react';

interface Props {
  className?: string;
}

/**
 * Rasm yo‘q bo‘lsa — placeholder.
 * Hech qachon ovqat rasmi avto-generatsiya qilinmaydi.
 */
export function DishPlaceholder({ className = '' }: Props) {
  return (
    <div className={`flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-t-[20px] bg-muted ${className}`}>
      <UtensilsCrossed className="h-10 w-10 text-ink-300" />
      <span className="text-[11px] text-ink-300">Rasm yo‘q</span>
    </div>
  );
}
