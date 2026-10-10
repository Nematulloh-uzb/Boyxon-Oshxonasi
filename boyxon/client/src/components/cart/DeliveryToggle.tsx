import { Bike, Store } from 'lucide-react';
import { cn } from '../../lib/utils';

interface Props {
  value: 'delivery' | 'pickup';
  onChange: (v: 'delivery' | 'pickup') => void;
}

export function DeliveryToggle({ value, onChange }: Props) {
  const opts = [
    { v: 'delivery' as const, l: 'Yetkazib berish', Icon: Bike },
    { v: 'pickup' as const, l: 'Olib ketish', Icon: Store },
  ];
  return (
    <div className="grid grid-cols-2 gap-2 rounded-2xl bg-[#F5EFE7] p-1">
      {opts.map(({ v, l, Icon }) => (
        <button
          key={v}
          onClick={() => onChange(v)}
          className={cn(
            'flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition',
            value === v ? 'bg-white text-primary-700 shadow-sm' : 'text-ink-300',
          )}
        >
          <Icon className="h-4 w-4" />
          {l}
        </button>
      ))}
    </div>
  );
}
