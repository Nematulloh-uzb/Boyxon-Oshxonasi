import { cn } from '../../lib/utils';

interface Props {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}

export function Switch({ checked, onChange, label }: Props) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn('h-7 w-12 rounded-full p-1 transition', checked ? 'bg-accent' : 'bg-line-strong')}
    >
      <span
        className={cn('block h-5 w-5 rounded-full bg-surface shadow transition', checked && 'translate-x-5')}
      />
    </button>
  );
}
