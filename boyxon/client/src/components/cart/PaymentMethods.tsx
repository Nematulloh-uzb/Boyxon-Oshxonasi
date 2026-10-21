import { Banknote, MousePointerClick, Smartphone, Wallet } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PAYMENT_METHODS } from '../../lib/constants';
import { cn } from '../../lib/utils';

const icons: Record<string, typeof Smartphone> = {
  payme: Smartphone,
  click: MousePointerClick,
  uzum: Wallet,
  cash: Banknote,
};

interface Props {
  value: string;
  onChange: (v: string) => void;
}

export function PaymentMethods({ value, onChange }: Props) {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-2 gap-2">
      {PAYMENT_METHODS.map((m) => {
        const Icon = icons[m.value] ?? Wallet;
        const active = value === m.value;
        return (
          <button
            key={m.value}
            onClick={() => onChange(m.value)}
            className={cn(
              'flex items-center gap-2 rounded-2xl border px-3 py-3 text-sm font-medium transition',
              active ? 'border-primary-500 bg-primary-50 text-primary-800' : 'border-ink-line bg-surface text-ink-700',
            )}
          >
            <Icon className="h-4 w-4" />
            {t(`payment.${m.value}`)}
          </button>
        );
      })}
    </div>
  );
}
