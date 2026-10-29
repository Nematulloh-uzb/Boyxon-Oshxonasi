import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface Props {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
  disabled?: boolean;
  pending?: boolean;
}

/**
 * iPhone uslubidagi switch: 46×28 trek, 24px oq tugma.
 * Yoqilgan rang — saytning asosiy (orange) rangi.
 * Bosilganda vizual holat darhol o'zgaradi; tarmoq javobi kutilmaydi.
 */
export function Switch({ checked, onChange, label, disabled, pending }: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-busy={pending || undefined}
      aria-label={label}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={cn(
        'relative inline-flex h-[28px] w-[46px] shrink-0 cursor-pointer items-center rounded-full p-[2px] transition-colors duration-200 ease-out',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
        checked ? 'bg-accent' : 'bg-[#E9E9EA] dark:bg-[#39393D]',
        disabled && !pending && 'cursor-not-allowed opacity-50',
        disabled && pending && 'cursor-wait',
        pending && !disabled && 'opacity-60',
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'grid h-6 w-6 place-items-center rounded-full bg-white shadow-[0_2px_4px_rgba(0,0,0,0.18),0_1px_1px_rgba(0,0,0,0.12)] will-change-transform transition-transform duration-200 ease-out',
          checked ? 'translate-x-[18px]' : 'translate-x-0',
        )}
      >
        {pending && <Loader2 className="h-3.5 w-3.5 animate-spin text-accent" strokeWidth={3} />}
      </span>
    </button>
  );
}
