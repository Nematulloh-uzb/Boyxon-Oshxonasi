import { AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useKitchenStatus } from '../../hooks/useKitchenStatus';

/**
 * Oshxona yopiq bo'lganda sayt bo'ylab ko'rinadigan qisqa ogohlantirish.
 * Holat noma'lum (yuklanmoqda/xato) bo'lsa hech narsa ko'rsatilmaydi —
 * yakuniy qaror baribir serverda.
 */
export function KitchenClosedBanner() {
  const { t } = useTranslation();
  const { data } = useKitchenStatus();
  if (data?.kitchenOpen !== false) return null;

  return (
    <div role="status" aria-live="polite" className="border-b border-danger/20 bg-danger/10">
      <div className="mx-auto flex max-w-6xl items-start gap-2 px-4 py-2.5 text-sm text-danger">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <p>
          <span className="font-semibold">{t('kitchen.closed')}.</span> {t('kitchen.desc_closed')}
        </p>
      </div>
    </div>
  );
}
