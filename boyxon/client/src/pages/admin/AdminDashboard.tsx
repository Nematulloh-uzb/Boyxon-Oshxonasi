import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChefHat, Clock, IndianRupee, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { adminApi } from '../../api/admin.api';
import { settingsApi } from '../../api/settings.api';
import { KpiCard } from '../../components/admin/KpiCard';
import { Card } from '../../components/ui/Card';
import { formatDate, formatPrice } from '../../lib/format';

export default function AdminDashboard() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminApi.stats(),
    refetchInterval: 30_000,
  });
  const { data: kitchen } = useQuery({
    queryKey: ['settings'],
    queryFn: settingsApi.get,
    refetchInterval: 60_000,
  });
  const kitchenOpen = kitchen?.kitchenOpen;
  const toggleKitchen = useMutation({
    mutationFn: (next: boolean) => adminApi.updateSettings({ kitchenOpen: next }),
    onSuccess: (r) => {
      qc.setQueryData(['settings'], r.data);
      toast.success(t('kitchen.updated'));
    },
    onError: () => toast.error(t('kitchen.update_error')),
  });
  const s = data?.data;
  const kitchenTone =
    kitchenOpen === undefined
      ? 'bg-surface-raised text-ink-300'
      : kitchenOpen
        ? 'bg-success/10 text-success'
        : 'bg-danger/10 text-danger';
  const kitchenDot =
    kitchenOpen === undefined ? 'animate-pulse bg-ink-300' : kitchenOpen ? 'bg-success' : 'bg-danger';

  return (
    <div className="space-y-6">
      <Card className="flex flex-wrap items-center justify-between gap-4 p-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${kitchenTone}`}>
            <ChefHat className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="font-display font-bold">{t('kitchen.title')}</p>
            <p className="text-sm text-ink-300">
              {kitchenOpen === undefined
                ? t('common.loading')
                : kitchenOpen
                  ? t('kitchen.desc_open')
                  : t('kitchen.desc_closed')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${kitchenTone}`}
          >
            <span className={`h-2 w-2 rounded-full ${kitchenDot}`} />
            {kitchenOpen === undefined ? '…' : kitchenOpen ? t('kitchen.open') : t('kitchen.closed')}
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={kitchenOpen === true}
            aria-label={t('kitchen.title')}
            disabled={kitchenOpen === undefined || toggleKitchen.isPending}
            onClick={() => {
              if (kitchenOpen !== undefined) toggleKitchen.mutate(!kitchenOpen);
            }}
            className={`relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
              kitchenOpen ? 'bg-success' : 'bg-ink-300/60'
            }`}
          >
            <span
              className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${
                kitchenOpen ? 'left-6' : 'left-1'
              }`}
            />
          </button>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <KpiCard icon={IndianRupee} label={t('admin.revenue')} value={formatPrice(s?.revenue ?? 0)} loading={isLoading} tone="success" />
        <KpiCard icon={Clock} label={t('admin.pending_orders')} value={String(s?.pendingOrders ?? 0)} loading={isLoading} tone="primary" />
        <KpiCard icon={ChefHat} label={t('admin.active_dishes')} value={String(s?.dishes ?? 0)} loading={isLoading} tone="ink" />
        <KpiCard icon={Users} label={t('admin.total_users')} value={String(s?.users ?? 0)} loading={isLoading} tone="danger" />
      </div>

      <Card className="overflow-hidden">
        <div className="border-b border-ink-line px-4 py-3 font-display font-bold">{t('admin.recent_orders')}</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-raised text-left text-xs text-ink-300">
              <tr>
                <th className="px-4 py-2.5">{t('admin.col_num')}</th>
                <th className="px-4 py-2.5">{t('admin.col_customer')}</th>
                <th className="px-4 py-2.5">{t('admin.col_total')}</th>
                <th className="px-4 py-2.5">{t('admin.col_status')}</th>
                <th className="px-4 py-2.5">{t('admin.col_date')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-line/60">
              {isLoading && (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-ink-300">{t('common.loading')}</td></tr>
              )}
              {s?.recentOrders.map((o) => (
                <tr key={o._id}>
                  <td className="px-4 py-3 font-semibold">{o.orderNumber}</td>
                  <td className="px-4 py-3">{typeof o.user === 'object' ? o.user.name : '—'}</td>
                  <td className="px-4 py-3">{formatPrice(o.total)}</td>
                  <td className="px-4 py-3">{t(`status.${o.status}`)}</td>
                  <td className="px-4 py-3 text-ink-300">{formatDate(o.createdAt)}</td>
                </tr>
              ))}
              {!isLoading && !s?.recentOrders.length && (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-ink-300">{t('admin.orders_empty')}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
