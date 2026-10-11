import { useQuery } from '@tanstack/react-query';
import { ChefHat, Clock, IndianRupee, Users } from 'lucide-react';
import { adminApi } from '../../api/admin.api';
import { KpiCard } from '../../components/admin/KpiCard';
import { Card } from '../../components/ui/Card';
import { formatDate, formatPrice, ORDER_STATUS_LABEL } from '../../lib/format';

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminApi.stats(),
    refetchInterval: 30_000,
  });
  const s = data?.data;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <KpiCard icon={IndianRupee} label="Tushum" value={formatPrice(s?.revenue ?? 0)} loading={isLoading} tone="success" />
        <KpiCard icon={Clock} label="Faol buyurtmalar" value={String(s?.pendingOrders ?? 0)} loading={isLoading} tone="primary" />
        <KpiCard icon={ChefHat} label="Faol taomlar" value={String(s?.dishes ?? 0)} loading={isLoading} tone="ink" />
        <KpiCard icon={Users} label="Foydalanuvchilar" value={String(s?.users ?? 0)} loading={isLoading} tone="danger" />
      </div>

      <Card className="overflow-hidden">
        <div className="border-b border-ink-line px-4 py-3 font-display font-bold">So‘nggi buyurtmalar</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-black/5 dark:bg-white/10 text-left text-xs text-ink-300">
              <tr>
                <th className="px-4 py-2.5">№</th>
                <th className="px-4 py-2.5">Mijoz</th>
                <th className="px-4 py-2.5">Jami</th>
                <th className="px-4 py-2.5">Holat</th>
                <th className="px-4 py-2.5">Sana</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-line/60">
              {isLoading && (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-ink-300">Yuklanmoqda...</td></tr>
              )}
              {s?.recentOrders.map((o) => (
                <tr key={o._id}>
                  <td className="px-4 py-3 font-semibold">{o.orderNumber}</td>
                  <td className="px-4 py-3">{typeof o.user === 'object' ? o.user.name : '—'}</td>
                  <td className="px-4 py-3">{formatPrice(o.total)}</td>
                  <td className="px-4 py-3">{ORDER_STATUS_LABEL[o.status]}</td>
                  <td className="px-4 py-3 text-ink-300">{formatDate(o.createdAt)}</td>
                </tr>
              ))}
              {!isLoading && !s?.recentOrders.length && (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-ink-300">Buyurtmalar yo‘q</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
