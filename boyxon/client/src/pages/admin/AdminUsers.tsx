import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { adminApi } from '../../api/admin.api';
import { UsersTable } from '../../components/admin/UsersTable';
import { useDebounce } from '../../hooks/useDebounce';

export default function AdminUsers() {
  const [search, setSearch] = useState('');
  const debounced = useDebounce(search, 400);
  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', debounced],
    queryFn: () => adminApi.users({ search: debounced || undefined, limit: 50 }),
  });

  return (
    <div className="space-y-4">
      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Ism yoki email..."
          className="h-11 w-full rounded-xl border border-ink-line bg-surface pl-9 pr-3 text-sm outline-none focus:border-primary-500"
        />
      </div>
      <UsersTable users={data?.data ?? []} loading={isLoading} />
    </div>
  );
}
