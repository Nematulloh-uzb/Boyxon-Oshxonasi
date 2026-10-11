import { Trash2 } from 'lucide-react';
import type { Promo } from '../../types';
import { Badge } from '../ui/Badge';

interface Props {
  promos: Promo[];
  loading?: boolean;
  onDelete: (p: Promo) => void;
}

export function PromosTable({ promos, loading, onDelete }: Props) {
  if (loading) return <div className="rounded-card bg-surface p-6 text-center text-ink-300">Yuklanmoqda...</div>;
  if (!promos.length) return <div className="rounded-card bg-surface p-6 text-center text-ink-300">Promolar yo‘q</div>;

  return (
    <div className="overflow-x-auto rounded-card bg-surface shadow-sm">
      <table className="w-full min-w-[640px] text-sm">
        <thead className="border-b border-ink-line bg-surface-raised text-left text-xs text-ink-300">
          <tr>
            <th className="px-4 py-3">Kod</th>
            <th className="px-4 py-3">Tavsif</th>
            <th className="px-4 py-3">Chegirma</th>
            <th className="px-4 py-3">Min. summa</th>
            <th className="px-4 py-3">Holat</th>
            <th className="px-4 py-3 text-right">Amallar</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-line/60">
          {promos.map((p) => (
            <tr key={p._id}>
              <td className="px-4 py-3">
                <Badge tone="promo">{p.code}</Badge>
              </td>
              <td className="max-w-[240px] truncate px-4 py-3 text-ink-300">{p.description ?? '—'}</td>
              <td className="px-4 py-3 font-semibold">
                {p.type === 'percent' ? `${p.value}%` : `${p.value.toLocaleString('uz-UZ')} so'm`}
                {p.maxDiscount ? ` (max ${p.maxDiscount.toLocaleString('uz-UZ')})` : ''}
              </td>
              <td className="px-4 py-3 text-ink-300">{p.minOrderAmount.toLocaleString('uz-UZ')} so‘m</td>
              <td className="px-4 py-3">
                <span className={`rounded-full px-2 py-1 text-xs font-semibold ${p.isActive ? 'bg-success/10 text-success' : 'bg-surface-raised text-ink-300'}`}>
                  {p.isActive ? 'Faol' : 'Nofaol'}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end">
                  <button onClick={() => onDelete(p)} className="rounded-lg p-2 text-danger hover:bg-danger/10" aria-label="O‘chirish">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
