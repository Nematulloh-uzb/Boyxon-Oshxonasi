import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/admin.api';
import { OrdersTable } from '../../components/admin/OrdersTable';

const FILTERS = [
  { v: '', l: 'Hammasi' },
  { v: 'pending', l: 'Kutilmoqda' },
  { v: 'confirmed', l: 'Tasdiqlandi' },
  { v: 'preparing', l: 'Tayyorlanmoqda' },
  { v: 'on_way', l: 'Yo‘lda' },
  { v: 'delivered', l: 'Yetkazildi' },
  { v: 'cancelled', l: 'Bekor qilindi' },
];

export default function AdminOrders() {
  const [status, setStatus] = useState('');
  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', status],
    queryFn: () => adminApi.orders({ status: status || undefined, limit: 50 }),
    refetchInterval: 15_000,
  });

  return (
    <div className="space-y-4">
      <div className="no-scrollbar flex gap-2 overflow-x-auto">
        {FILTERS.map((f) => (
          <button
            key={f.v}
            onClick={() => setStatus(f.v)}
            className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium ${
              status === f.v ? 'border-primary-500 bg-primary-500 text-white' : 'border-ink-line bg-white text-ink-700'
            }`}
          >
            {f.l}
          </button>
        ))}
      </div>
      <OrdersTable orders={data?.data ?? []} loading={isLoading} />
    </div>
  );
}
