import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCart } from '../../hooks/useCart';
import { useUiStore } from '../../store/ui.store';
import { CartItem } from '../../components/cart/CartItem';
import { CartSummary } from '../../components/cart/CartSummary';
import { CheckoutSheet } from '../../components/cart/CheckoutSheet';
import { Button } from '../../components/ui/Button';
import { DELIVERY_FEE, FREE_DELIVERY_FROM } from '../../lib/constants';
import { formatPrice } from '../../lib/format';

export default function CartPage() {
  const { t } = useTranslation();
  const { lines, setQty, remove, subtotal, discount } = useCart();
  const set = useUiStore((s) => s.set);
  const deliveryFee = subtotal >= FREE_DELIVERY_FROM ? 0 : DELIVERY_FEE;
  const total = Math.max(0, subtotal + deliveryFee - discount);

  if (!lines.length) {
    return (
      <div className="mx-auto flex max-w-6xl flex-col items-center px-4 py-20 text-center">
        <span className="grid h-20 w-20 place-items-center rounded-full bg-muted">
          <ShoppingBag className="h-9 w-9 text-ink-300" />
        </span>
        <h1 className="mt-4 font-display text-xl font-bold">{t('cart.empty')}</h1>
        <p className="mt-1 text-sm text-ink-300">{t('cart.emptyHint')}</p>
        <Link to="/">
          <Button className="mt-6">{t('cart.toMenu')}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-5">
      <h1 className="mb-4 font-display text-2xl font-extrabold">{t('cart.title')}</h1>
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          {lines.map((l) => (
            <CartItem key={l.dishId} line={l} onQty={setQty} onRemove={remove} />
          ))}
        </div>
        <aside className="hidden lg:sticky lg:top-24 lg:block lg:self-start">
          <CartSummary subtotal={subtotal} deliveryFee={deliveryFee} discount={discount} total={total} />
          <Button className="mt-3 w-full" size="lg" onClick={() => set({ checkoutOpen: true })}>
            {t('cart.checkout')}
          </Button>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-16 z-20 border-t border-ink-line bg-surface p-3 md:hidden">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
          <div>
            <p className="text-xs text-ink-300">{t('cart.total')}</p>
            <p className="font-bold text-primary-600">{formatPrice(total)}</p>
          </div>
          <Button onClick={() => set({ checkoutOpen: true })}>{t('cart.checkout')}</Button>
        </div>
      </div>

      <CheckoutSheet />
    </div>
  );
}
