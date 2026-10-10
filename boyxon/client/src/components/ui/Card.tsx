import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-card border border-ink-line/60 bg-white shadow-sm', className)}>
      {children}
    </div>
  );
}
