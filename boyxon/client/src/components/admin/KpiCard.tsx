import type { LucideIcon } from 'lucide-react';
import { Card } from '../ui/Card';
import { Skeleton } from '../ui/Skeleton';

interface Props {
  icon: LucideIcon;
  label: string;
  value: string;
  loading?: boolean;
  tone?: 'primary' | 'success' | 'danger' | 'ink';
}

const tones = {
  primary: 'bg-primary-100 text-primary-600',
  success: 'bg-success/10 text-success',
  danger: 'bg-danger/10 text-danger',
  ink: 'bg-surface-raised text-ink-700',
};

export function KpiCard({ icon: Icon, label, value, loading, tone = 'primary' }: Props) {
  return (
    <Card className="flex items-center gap-3 p-4">
      <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${tones[tone]}`}>
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-ink-300">{label}</p>
        {loading ? <Skeleton className="mt-1 h-6 w-20" /> : <p className="truncate font-display text-xl font-bold">{value}</p>}
      </div>
    </Card>
  );
}
