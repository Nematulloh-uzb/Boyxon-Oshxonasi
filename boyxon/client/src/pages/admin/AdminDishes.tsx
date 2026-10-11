import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { adminApi } from '../../api/admin.api';
import { categoriesApi } from '../../api/categories.api';
import { DishesTable } from '../../components/admin/DishesTable';
import { DishFormDrawer } from '../../components/admin/DishFormDrawer';
import { Button } from '../../components/ui/Button';
import type { Dish } from '../../types';

export default function AdminDishes() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState<Dish | null>(null);

  const { data: cats } = useQuery({ queryKey: ['categories-admin'], queryFn: () => categoriesApi.list().then((r) => r.data) });
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dishes', search],
    queryFn: () => adminApi.dishes({ search: search || undefined, limit: 50 }),
  });

  const refresh = (): void => void qc.invalidateQueries({ queryKey: ['admin-dishes'] });

  const toggleM = useMutation({
    mutationFn: (id: string) => adminApi.toggleDish(id),
    onSuccess: () => { refresh(); toast.success(t('admin.status_changed')); },
  });
  const deleteM = useMutation({
    mutationFn: (id: string) => adminApi.deleteDish(id),
    onSuccess: () => { refresh(); toast.success(t('admin.dish_deleted')); },
    onError: () => toast.error(t('admin.delete_error')),
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-300" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('admin.search_dishes')}
            className="h-11 w-full rounded-xl border border-ink-line bg-surface pl-9 pr-3 text-sm outline-none focus:border-primary-500"
          />
        </div>
        <Button onClick={() => { setEditing(null); setDrawerOpen(true); }}>
          <Plus className="h-4 w-4" /> {t('admin.new_dish')}
        </Button>
      </div>

      <DishesTable
        dishes={data?.data ?? []}
        loading={isLoading}
        onEdit={(d) => { setEditing(d); setDrawerOpen(true); }}
        onToggle={(d) => toggleM.mutate(d._id)}
        onDelete={(d) => {
          if (confirm(t('admin.delete_confirm', { name: d.name }))) deleteM.mutate(d._id);
        }}
      />

      <DishFormDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        dish={editing}
        categories={cats ?? []}
        onSaved={refresh}
      />
    </div>
  );
}
