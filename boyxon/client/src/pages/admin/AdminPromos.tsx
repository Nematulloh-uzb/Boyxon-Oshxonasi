import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { adminApi } from '../../api/admin.api';
import { PromosTable } from '../../components/admin/PromosTable';
import { Sheet } from '../../components/ui/Sheet';
import { Button } from '../../components/ui/Button';
import type { Promo } from '../../types';

const emptyForm = { code: '', description: '', type: 'percent', value: '', minOrderAmount: '0', maxDiscount: '' };

export default function AdminPromos() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const { data, isLoading } = useQuery({ queryKey: ['admin-promos'], queryFn: () => adminApi.promos() });
  const refresh = (): void => void qc.invalidateQueries({ queryKey: ['admin-promos'] });

  const createM = useMutation({
    mutationFn: () =>
      adminApi.createPromo({
        code: form.code,
        description: form.description || undefined,
        type: form.type as 'percent' | 'fixed',
        value: Number(form.value),
        minOrderAmount: Number(form.minOrderAmount),
        maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : undefined,
        isActive: true,
      }),
    onSuccess: () => { toast.success(t('admin.promo_created')); refresh(); setOpen(false); setForm(emptyForm); },
    onError: (e) => toast.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? t('common.error')),
  });

  const deleteM = useMutation({
    mutationFn: (id: string) => adminApi.deletePromo(id),
    onSuccess: () => { toast.success(t('common.deleted')); refresh(); },
  });

  const inputCls = 'h-11 w-full rounded-xl border border-ink-line px-3 text-sm outline-none focus:border-primary-500';

  return (
    <div className="space-y-4">
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> {t('admin.new_promo')}
      </Button>

      <PromosTable
        promos={data?.data ?? []}
        loading={isLoading}
        onDelete={(p) => { if (confirm(t('admin.delete_confirm', { name: p.code }))) deleteM.mutate(p._id); }}
      />

      <Sheet open={open} onClose={() => setOpen(false)} title={t('admin.new_promo_title')}>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-ink-700">{t('admin.promo_code_field')} *</label>
            <input className={inputCls} value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="YANGI25" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-ink-700">{t('admin.promo_description')}</label>
            <input className={inputCls} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-ink-700">{t('admin.promo_type')}</label>
              <select className={inputCls} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="percent">{t('admin.promo_percent')}</option>
                <option value="fixed">{t('admin.promo_fixed')}</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-ink-700">{t('admin.promo_value')} *</label>
              <input type="number" className={inputCls} value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-ink-700">{t('admin.promo_min')}</label>
              <input type="number" className={inputCls} value={form.minOrderAmount} onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-ink-700">{t('admin.promo_max')}</label>
              <input type="number" className={inputCls} value={form.maxDiscount} onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })} />
            </div>
          </div>
          <Button
            className="w-full"
            disabled={createM.isPending || !form.code || !form.value}
            onClick={() => createM.mutate()}
          >
            {createM.isPending ? t('common.creating') : t('common.create')}
          </Button>
        </div>
      </Sheet>
    </div>
  );
}
