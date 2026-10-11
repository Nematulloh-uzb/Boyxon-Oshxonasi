import { useState } from 'react';
import { TicketPercent } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { promosApi } from '../../api/promos.api';
import { useCart } from '../../hooks/useCart';

export function PromoInput() {
  const { t } = useTranslation();
  const { promoCode, subtotal, setPromo } = useCart();
  const [code, setCode] = useState(promoCode ?? '');
  const [loading, setLoading] = useState(false);

  const apply = async (): Promise<void> => {
    if (!code.trim()) return;
    setLoading(true);
    try {
      const r = await promosApi.validate(code.trim(), subtotal);
      setPromo(r.data.code, r.data.discount);
      toast.success(r.message);
    } catch (e) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? t('cart.promo_invalid');
      toast.error(msg);
      setPromo(undefined, 0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-ink-700">{t('cart.promo_placeholder')}</label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <TicketPercent className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="WELCOME10"
            className="h-12 w-full rounded-2xl border border-ink-line bg-surface pl-9 pr-3 uppercase outline-none focus:border-primary-500"
          />
        </div>
        <button
          onClick={() => void apply()}
          disabled={loading}
          className="h-12 rounded-2xl bg-accent px-5 text-sm font-semibold text-white hover:bg-accent-hover disabled:opacity-50"
        >
          {loading ? '...' : t('cart.promo_apply')}
        </button>
      </div>
      {promoCode && (
        <p className="mt-1.5 text-xs font-medium text-success">{t('cart.promo_applied', { code: promoCode })}</p>
      )}
    </div>
  );
}
