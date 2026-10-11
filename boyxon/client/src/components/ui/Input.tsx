import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

// react-hook-form register() ref talab qiladi — forwardRef shart
export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...rest }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          'h-12 w-full rounded-2xl border border-ink-line bg-surface px-4 text-[15px] outline-none',
          'placeholder:text-ink-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-100',
          className,
        )}
        {...rest}
      />
    );
  },
);
