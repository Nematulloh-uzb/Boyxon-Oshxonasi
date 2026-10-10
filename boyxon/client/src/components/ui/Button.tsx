import type { ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({ variant = 'primary', size = 'md', className, ...rest }: Props) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition active:scale-[0.98] disabled:opacity-50',
        size === 'sm' && 'h-9 px-4 text-sm',
        size === 'md' && 'h-12 px-6 text-[15px]',
        size === 'lg' && 'h-[52px] px-8 text-base',
        variant === 'primary' && 'bg-primary-500 text-white hover:bg-primary-600',
        variant === 'outline' && 'border border-ink-line bg-white text-ink-700',
        variant === 'ghost' && 'text-ink-700 hover:bg-black/5',
        variant === 'danger' && 'bg-danger text-white',
        className,
      )}
      {...rest}
    />
  );
}
