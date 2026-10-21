import { cn } from '../../lib/utils';

export function Badge({ children, tone = 'default' }: { children: React.ReactNode; tone?: 'default' | 'success' | 'danger' | 'promo' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        tone === 'default' && 'bg-surface-raised text-ink-700',
        tone === 'success' && 'bg-success/10 text-success',
        tone === 'danger' && 'bg-danger/10 text-danger',
        tone === 'promo' && 'bg-primary-100 text-primary-800',
      )}
    >
      {children}
    </span>
  );
}
