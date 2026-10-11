import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { adminApi } from '../../api/admin.api';
import { categoriesApi } from '../../api/categories.api';
import { Sheet } from '../../components/ui/Sheet';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import type { Category } from '../../types';

const empty = { name: '', slug: '', icon: '', order: '0' };

export default function AdminCategories() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState(empty);

  const { data, isLoading } = useQuery({ queryKey: ['admin-categories'], queryFn: () => adminApi.categories() });
  const refresh = (): void => void qc.invalidateQueries({ queryKey: ['admin-categories'] });

  const saveM = useMutation({
    mutationFn: () => {
      const body = { name: form.name, slug: form.slug, icon: form.icon || undefined, order: Number(form.order) };
      return editing ? adminApi.updateCategory(editing._id, body) : adminApi.createCategory(body);
    },
    onSuccess: () => { toast.success(editing ? 'Yangilandi' : 'Yaratildi'); refresh(); setOpen(false); },
    onError: (e) => toast.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Xatolik'),
  });

  const deleteM = useMutation({
    mutationFn: (id: string) => adminApi.deleteCategory(id),
    onSuccess: () => { toast.success('O‘chirildi'); refresh(); },
    onError: (e) => toast.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'O‘chirib bo‘lmadi'),
  });

  const inputCls = 'h-11 w-full rounded-xl border border-ink-line px-3 text-sm outline-none focus:border-primary-500';

  return (
    <div className="space-y-4">
      <Button
        onClick={() => { setEditing(null); setForm(empty); setOpen(true); }}
      >
        <Plus className="h-4 w-4" /> Yangi kategoriya
      </Button>

      {isLoading && <div className="rounded-card bg-surface p-6 text-center text-ink-300">Yuklanmoqda...</div>}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {data?.data.map((c) => (
          <Card key={c._id} className="flex items-center justify-between p-4">
            <div>
              <p className="font-semibold">{c.name}</p>
              <p className="text-xs text-ink-300">/{c.slug} · {c.order}</p>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => { setEditing(c); setForm({ name: c.name, slug: c.slug, icon: c.icon ?? '', order: String(c.order) }); setOpen(true); }}
                className="rounded-lg p-2 hover:bg-black/5 dark:hover:bg-white/10"
                aria-label="Tahrirlash"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                onClick={() => { if (confirm(`“${c.name}” o‘chirilsinmi?`)) deleteM.mutate(c._id); }}
                className="rounded-lg p-2 text-danger hover:bg-danger/10"
                aria-label="O‘chirish"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </Card>
        ))}
      </div>

      <Sheet open={open} onClose={() => setOpen(false)} title={editing ? 'Kategoriyani tahrirlash' : 'Yangi kategoriya'}>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-ink-700">Nomi *</label>
            <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-ink-700">Slug *</label>
            <input className={inputCls} value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase() })} placeholder="palovlar" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-ink-700">Ikonka (lucide)</label>
              <input className={inputCls} value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="Soup" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-ink-700">Tartib</label>
              <input type="number" className={inputCls} value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} />
            </div>
          </div>
          <Button className="w-full" disabled={saveM.isPending || !form.name || !form.slug} onClick={() => saveM.mutate()}>
            {saveM.isPending ? 'Saqlanmoqda...' : 'Saqlash'}
          </Button>
        </div>
      </Sheet>
    </div>
  );
}
