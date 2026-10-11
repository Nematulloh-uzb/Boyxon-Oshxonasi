import { Minus, Plus, Trash2 } from 'lucide-react';
import type { CartLine } from '../../store/cart.store';
import { formatPrice } from '../../lib/format';

interface Props {
  line: CartLine;
  onQty: (dishId: string, qty: number) => void;
  onRemove: (dishId: string) => void;
}

export function CartItem({ line, onQty, onRemove }: Props) {
  return (
    <div className="flex gap-3 rounded-card border border-ink-line/60 bg-surface p-3 shadow-sm">
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-muted">
        {line.image ? (
          <img src={line.image} alt={line.name} className="h-full w-full object-cover" />
        ) : (
          <div className="grid h-full w-full place-items-center text-[10px] text-ink-300">yo‘q</div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="line-clamp-1 font-semibold text-ink-900">{line.name}</p>
          <button onClick={() => onRemove(line.dishId)} className="text-ink-300 hover:text-danger" aria-label="O‘chirish">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-0.5 text-sm font-bold text-primary-600">{formatPrice(line.price)}</p>
        <div className="mt-2 flex items-center gap-3">
          <div className="flex items-center gap-1 rounded-full border border-ink-line px-1">
            <button onClick={() => onQty(line.dishId, line.quantity - 1)} className="grid h-8 w-8 place-items-center rounded-full hover:bg-black/5 dark:hover:bg-white/10" aria-label="Kamaytirish">
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-6 text-center text-sm font-semibold">{line.quantity}</span>
            <button onClick={() => onQty(line.dishId, line.quantity + 1)} className="grid h-8 w-8 place-items-center rounded-full hover:bg-black/5 dark:hover:bg-white/10" aria-label="Ko‘paytirish">
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <span className="text-sm font-bold text-ink-900">{formatPrice(line.price * line.quantity)}</span>
        </div>
      </div>
    </div>
  );
}
