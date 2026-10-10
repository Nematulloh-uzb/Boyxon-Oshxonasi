import { UtensilsCrossed } from 'lucide-react';

/**
 * Rasm yo‘q bo‘lsa — placeholder.
 * Hech qachon ovqat rasmi avto-generatsiya qilinmaydi.
 */
export function DishPlaceholder() {
  return (
    <div className="flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-t-[20px] bg-[#F5EFE7]">
      <UtensilsCrossed className="h-10 w-10 text-[#7F8C8D]" />
      <span className="text-[11px] text-[#7F8C8D]">Rasm yo‘q</span>
    </div>
  );
}
