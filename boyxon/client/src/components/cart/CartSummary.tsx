import { useTranslation } from 'react-i18next';
import { formatPrice, tVal } from '../../lib/format';
import { FREE_DELIVERY_FROM } from '../../lib/constants';
import { Card } from '../ui/Card';

interface Props {
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
}

export function CartSummary({ subtotal, deliveryFee, discount, total }: Props) {
  const { t } = useTranslation();
  const toFree = FREE_DELIVERY_FROM - subtotal;
  return (
    <Card className="space-y-2.5 p-4">
      <div className="flex justify-between text-sm">
        <span className="text-ink-300">{t('cart.subtotal')}</span>
        <span className="font-medium">{formatPrice(subtotal)}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-ink-300">{t('cart.delivery_fee')}</span>
        <span className="font-medium">{deliveryFee === 0 ? t('cart.free') : formatPrice(deliveryFee)}</span>
      </div>
      {discount > 0 && (
        <div className="flex justify-between text-sm">
          <span className="text-ink-300">{t('cart.discount')}</span>
          <span className="font-medium text-success">−{formatPrice(discount)}</span>
        </div>
      )}
      {toFree > 0 && (
        <p className="rounded-xl bg-primary-50 px-3 py-2 text-xs text-primary-700">
          {t('cart.free_delivery_hint', { amount: formatPrice(toFree) })}
        </p>
      )}
      <div className="flex justify-between border-t border-ink-line pt-2.5 text-base font-bold">
        <span>{t('cart.total')}</span>
        <span className="text-primary-600">{formatPrice(total)}</span>
      </div>
    </Card>
  );
}
