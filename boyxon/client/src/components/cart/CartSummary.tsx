import { useTranslation } from 'react-i18next';
import { formatPrice, tVal } from '../../lib/format';
import { DELIVERY_FEE, FREE_DELIVERY_FROM } from '../../lib/constants';
import { Card } from '../ui/Card';

interface Props {
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
}

export function CartSummary({ subtotal, deliveryFee, discount, total }: Props) {
  const { t } = useTranslation();
  // Yetkazish "bepul" emas — mijozning cho'ntagida qoladigan pul sifatida ko'rsatiladi.
  const toFree = Math.max(0, FREE_DELIVERY_FROM - subtotal);
  const progress = Math.min(100, Math.round((subtotal / FREE_DELIVERY_FROM) * 100));
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
      {subtotal > 0 && toFree > 0 && (
        <div className="space-y-1.5 rounded-xl bg-primary-50 px-3 py-2.5">
          <p className="text-xs font-semibold text-primary-700">
            {tVal(t('cart.free_delivery_hint'), {
              amount: formatPrice(toFree),
              fee: formatPrice(DELIVERY_FEE),
            })}
          </p>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-primary-100" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
            <div className="h-full rounded-full bg-primary-500 transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}
      {subtotal >= FREE_DELIVERY_FROM && (
        <p className="rounded-xl bg-success/10 px-3 py-2 text-xs font-semibold text-success">
          {tVal(t('cart.free_delivery_done'), { fee: formatPrice(DELIVERY_FEE) })}
        </p>
      )}
      <div className="flex justify-between border-t border-ink-line pt-2.5 text-base font-bold">
        <span>{t('cart.total')}</span>
        <span className="text-primary-600">{formatPrice(total)}</span>
      </div>
    </Card>
  );
}
