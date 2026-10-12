import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import type { Order, OrderStatus } from '../../types';
import { formatDate, formatPrice } from '../../lib/format';
import { adminApi } from '../../api/admin.api';

const STATUSES: OrderStatus[] = ['pending', 'confirmed', 'packing', 'handed_to_taxi', 'delivered', 'cancelled'];

const tone: Record<OrderStatus, string> = {
  pending: 'bg-surface-raised text-ink-700',
  confirmed: 'bg-primary-100 text-primary-700',
  packing: 'bg-primary-50 text-primary-700',
  handed_to_taxi: 'bg-primary-100 text-primary-700',
  delivered: 'bg-success/10 text-success',
  cancelled: 'bg-danger/10 text-danger',
};

export function OrdersTable({ orders, loading }: { orders: Order[]; loading?: boolean }) {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const statusM = useMutation({
    mutationFn: ({ id, status, taxi }: { id: string; status: string; taxi?: { driver?: string; carNumber?: string; service?: string; note?: string } }) =>
      adminApi.updateStatus(id, status, undefined, taxi),
    onSuccess: (r) => {
      void qc.invalidateQueries({ queryKey: ['admin-orders'] });
      void qc.invalidateQueries({ queryKey: ['admin-stats'] });
      toast.success(r.message);
    },
    onError: () => toast.error(t('admin.status_error')),
  });

  /** Taksiga topshirish — haydovchi va davlat raqami ixtiyoriy. */
  const handleStatusChange = (order: Order, nextStatus: string) => {
    if (nextStatus !== 'handed_to_taxi') {
      statusM.mutate({ id: order._id, status: nextStatus });
      return;
    }
    const driver = window.prompt(t('admin.taxi_driver'))?.trim();
    const carNumber = window.prompt(t('admin.taxi_car_number'))?.trim();
    statusM.mutate({
      id: order._id,
      status: nextStatus,
      taxi: driver || carNumber ? { driver: driver || undefined, carNumber: carNumber || undefined } : undefined,
    });
  };

  if (loading) return <div className="rounded-card bg-surface p-6 text-center text-ink-300">{t('common.loading')}</div>;
  if (!orders.length) return <div className="rounded-card bg-surface p-6 text-center text-ink-300">{t('admin.orders_empty')}</div>;

  return (
    <div className="overflow-x-auto rounded-card bg-surface shadow-sm">
      <table className="w-full min-w-[760px] text-sm">
        <thead className="border-b border-ink-line bg-surface-raised text-left text-xs text-ink-300">
          <tr>
            <th className="px-4 py-3">{t('admin.col_num')}</th>
            <th className="px-4 py-3">{t('admin.col_customer')}</th>
            <th className="px-4 py-3">{t('admin.col_items')}</th>
            <th className="px-4 py-3">{t('admin.col_total')}</th>
            <th className="px-4 py-3">{t('admin.col_date')}</th>
            <th className="px-4 py-3">{t('admin.col_status')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-line/60">
          {orders.map((o) => (
            <tr key={o._id}>
              <td className="px-4 py-3 font-semibold">{o.orderNumber}</td>
              <td className="px-4 py-3">{typeof o.user === 'object' ? o.user.name : '—'}</td>
              <td className="max-w-[220px] truncate px-4 py-3 text-ink-300">
                {o.items.map((i) => `${i.name} ×${i.quantity}`).join(', ')}
              </td>
              <td className="px-4 py-3 font-semibold">{formatPrice(o.total)}</td>
              <td className="px-4 py-3 text-ink-300">{formatDate(o.createdAt)}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-1 text-xs font-semibold ${tone[o.status]}`}>
                    {t(`status.${o.status}`)}
                  </span>
                  {o.taxi && (
                    <span className="max-w-[160px] truncate text-xs text-ink-300" title={[o.taxi.driver, o.taxi.carNumber, o.taxi.service, o.taxi.note].filter(Boolean).join(' · ')}>
                      {[o.taxi.driver, o.taxi.carNumber].filter(Boolean).join(' · ') || t('orders.taxi_added')}
                    </span>
                  )}
                  <select
                    value={o.status}
                    onChange={(e) => handleStatusChange(o, e.target.value)}
                    className="h-8 rounded-lg border border-ink-line bg-surface px-1.5 text-xs outline-none"
                    disabled={statusM.isPending}
                  >
                    {STATUSES.map((s) => <option key={s} value={s}>{t(`status.${s}`)}</option>)}
                  </select>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
