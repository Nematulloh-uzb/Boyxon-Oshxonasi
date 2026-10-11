import { cn } from '../../lib/utils';

export function Badge({ children, tone = 'default' }: { children: React.ReactNode; tone?: 'default' | 'success' | 'danger' | 'promo' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        tone === 'default' && 'bg-black/5 dark:bg-white/10 text-ink-700',
        tone === 'success' && 'bg-success/10 text-success',
        tone === 'danger' && 'bg-danger/10 text-danger',
        tone === 'promo' && 'bg-[#FFDDB3] text-[#291800] dark:bg-primary-500/25 dark:text-primary-100',
      )}
    >
      {children}
    </span>
  );
}
