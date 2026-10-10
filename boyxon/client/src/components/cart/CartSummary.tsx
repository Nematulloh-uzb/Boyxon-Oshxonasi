import { formatPrice } from '../../lib/format';
import { FREE_DELIVERY_FROM } from '../../lib/constants';
import { Card } from '../ui/Card';

interface Props {
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
}

export function CartSummary({ subtotal, deliveryFee, discount, total }: Props) {
  const toFree = FREE_DELIVERY_FROM - subtotal;
  return (
    <Card className="space-y-2.5 p-4">
      <div className="flex justify-between text-sm">
        <span className="text-ink-300">Oraliq jami</span>
        <span className="font-medium">{formatPrice(subtotal)}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-ink-300">Yetkazib berish</span>
        <span className="font-medium">{deliveryFee === 0 ? 'Bepul' : formatPrice(deliveryFee)}</span>
      </div>
      {discount > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-ink-300">Chegirma</span>
          <span className="font-medium text-success">−{formatPrice(discount)}</span>
        </div>
      )}
      {toFree > 0 && (
        <p className="rounded-xl bg-primary-50 px-3 py-2 text-xs text-primary-700">
          Bepul yetkazish uchun yana {formatPrice(toFree)} qo‘shing
        </p>
      )}
      <div className="flex justify-between border-t border-ink-line pt-2.5 text-base font-bold">
        <span>Jami</span>
        <span className="text-primary-600">{formatPrice(total)}</span>
      </div>
    </Card>
  );
}
