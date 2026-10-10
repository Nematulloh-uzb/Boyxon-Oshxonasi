import { Pencil, Power, Trash2 } from 'lucide-react';
import type { Dish } from '../../types';
import { formatPrice } from '../../lib/format';
import { DishPlaceholder } from '../dish/DishPlaceholder';

interface Props {
  dishes: Dish[];
  loading?: boolean;
  onEdit: (d: Dish) => void;
  onToggle: (d: Dish) => void;
  onDelete: (d: Dish) => void;
}

export function DishesTable({ dishes, loading, onEdit, onToggle, onDelete }: Props) {
  if (loading) return <div className="rounded-card bg-white p-6 text-center text-ink-300">Yuklanmoqda...</div>;
  if (!dishes.length) return <div className="rounded-card bg-white p-6 text-center text-ink-300">Taomlar yo‘q</div>;

  return (
    <div className="overflow-x-auto rounded-card bg-white shadow-sm">
      <table className="w-full min-w-[720px] text-sm">
        <thead className="border-b border-ink-line bg-black/5 text-left text-xs text-ink-300">
          <tr>
            <th className="px-4 py-3">Taom</th>
            <th className="px-4 py-3">Narx</th>
            <th className="px-4 py-3">Kategoriya</th>
            <th className="px-4 py-3">Reyting</th>
            <th className="px-4 py-3">Holat</th>
            <th className="px-4 py-3 text-right">Amallar</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-line/60">
          {dishes.map((d) => (
            <tr key={d._id}>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-14 shrink-0 overflow-hidden rounded-lg">
                    {d.image ? (
                      <img src={d.image} alt={d.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="grid h-full w-full place-items-center bg-[#F5EFE7] text-[10px] text-ink-300">yo‘q</div>
                    )}
                  </div>
                  <span className="font-medium">{d.name}</span>
                </div>
              </td>
              <td className="px-4 py-3">{formatPrice(d.price)}</td>
              <td className="px-4 py-3 text-ink-300">{typeof d.category === 'object' ? d.category.name : '—'}</td>
              <td className="px-4 py-3">{d.rating.toFixed(1)}</td>
              <td className="px-4 py-3">
                <span className={`rounded-full px-2 py-1 text-xs font-semibold ${d.isActive ? 'bg-success/10 text-success' : 'bg-black/5 text-ink-300'}`}>
                  {d.isActive ? 'Faol' : 'Nofaol'}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-1">
                  <button onClick={() => onEdit(d)} className="rounded-lg p-2 hover:bg-black/5" aria-label="Tahrirlash"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => onToggle(d)} className="rounded-lg p-2 hover:bg-black/5" aria-label="Yoqish/o‘chirish"><Power className="h-4 w-4" /></button>
                  <button onClick={() => onDelete(d)} className="rounded-lg p-2 text-danger hover:bg-danger/10" aria-label="O‘chirish"><Trash2 className="h-4 w-4" /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
