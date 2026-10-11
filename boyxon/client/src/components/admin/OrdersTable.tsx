import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { Order, OrderStatus } from '../../types';
import { formatDate, formatPrice, ORDER_STATUS_LABEL } from '../../lib/format';
import { adminApi } from '../../api/admin.api';

const STATUSES: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'on_way', 'delivered', 'cancelled'];

const tone: Record<OrderStatus, string> = {
  pending: 'bg-surface-raised text-ink-700',
  confirmed: 'bg-primary-100 text-primary-700',
  preparing: 'bg-primary-50 text-primary-700',
  on_way: 'bg-primary-100 text-primary-700',
  delivered: 'bg-success/10 text-success',
  cancelled: 'bg-danger/10 text-danger',
};

export function OrdersTable({ orders, loading }: { orders: Order[]; loading?: boolean }) {
  const qc = useQueryClient();
  const statusM = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => adminApi.updateStatus(id, status),
    onSuccess: (r) => {
      void qc.invalidateQueries({ queryKey: ['admin-orders'] });
      void qc.invalidateQueries({ queryKey: ['admin-stats'] });
      toast.success(r.message);
    },
    onError: () => toast.error('Status yangilanmadi'),
  });

  if (loading) return <div className="rounded-card bg-surface p-6 text-center text-ink-300">Yuklanmoqda...</div>;
  if (!orders.length) return <div className="rounded-card bg-surface p-6 text-center text-ink-300">Buyurtmalar yo‘q</div>;

  return (
    <div className="overflow-x-auto rounded-card bg-surface shadow-sm">
      <table className="w-full min-w-[760px] text-sm">
        <thead className="border-b border-ink-line bg-surface-raised text-left text-xs text-ink-300">
          <tr>
            <th className="px-4 py-3">№</th>
            <th className="px-4 py-3">Mijoz</th>
            <th className="px-4 py-3">Tarkib</th>
            <th className="px-4 py-3">Jami</th>
            <th className="px-4 py-3">Sana</th>
            <th className="px-4 py-3">Holat</th>
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
                    {ORDER_STATUS_LABEL[o.status]}
                  </span>
                  <select
                    value={o.status}
                    onChange={(e) => statusM.mutate({ id: o._id, status: e.target.value })}
                    className="h-8 rounded-lg border border-ink-line bg-surface px-1.5 text-xs outline-none"
                    disabled={statusM.isPending}
                  >
                    {STATUSES.map((s) => <option key={s} value={s}>{ORDER_STATUS_LABEL[s]}</option>)}
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
