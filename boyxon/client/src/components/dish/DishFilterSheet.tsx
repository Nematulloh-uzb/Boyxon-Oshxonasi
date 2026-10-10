import { useEffect, useState } from 'react';
import { Sheet } from '../ui/Sheet';
import { Button } from '../ui/Button';

export interface DishFilterValues {
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  tags?: string;
  sort?: 'new' | 'price_asc' | 'price_desc' | 'rating' | 'popular';
}

interface Props {
  open: boolean;
  onClose: () => void;
  value: DishFilterValues;
  onApply: (v: DishFilterValues) => void;
}

const TAGS = [
  { v: 'vegetarian', l: 'Parhez' },
  { v: 'spicy', l: 'Achchiq' },
  { v: 'top', l: 'Top' },
  { v: 'new', l: 'Yangi' },
];

const SORTS: { v: DishFilterValues['sort']; l: string }[] = [
  { v: 'new', l: 'Yangi' },
  { v: 'rating', l: 'Reyting' },
  { v: 'price_asc', l: 'Arzon' },
  { v: 'price_desc', l: 'Qimmat' },
  { v: 'popular', l: 'Mashhur' },
];

export function DishFilterSheet({ open, onClose, value, onApply }: Props) {
  const [draft, setDraft] = useState<DishFilterValues>(value);
  useEffect(() => setDraft(value), [value, open]);

  return (
    <Sheet open={open} onClose={onClose} title="Filtr">
      <div className="space-y-5">
        <div>
          <p className="mb-2 text-sm font-semibold text-ink-700">Narx (so‘m)</p>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="dan"
              value={draft.minPrice ?? ''}
              onChange={(e) => setDraft({ ...draft, minPrice: e.target.value ? Number(e.target.value) : undefined })}
              className="h-11 w-full rounded-xl border border-ink-line px-3 outline-none focus:border-primary-500"
            />
            <input
              type="number"
              placeholder="gacha"
              value={draft.maxPrice ?? ''}
              onChange={(e) => setDraft({ ...draft, maxPrice: e.target.value ? Number(e.target.value) : undefined })}
              className="h-11 w-full rounded-xl border border-ink-line px-3 outline-none focus:border-primary-500"
            />
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-semibold text-ink-700">Minimal reyting</p>
          <div className="flex flex-wrap gap-2">
            {[0, 4, 4.5, 4.7].map((r) => (
              <button
                key={r}
                onClick={() => setDraft({ ...draft, rating: r === 0 ? undefined : r })}
                className={`rounded-full border px-3 py-1.5 text-sm ${draft.rating === r || (r === 0 && !draft.rating) ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-ink-line'}`}
              >
                {r === 0 ? 'Hammasi' : `${r}+`}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-semibold text-ink-700">Teglar</p>
          <div className="flex flex-wrap gap-2">
            {TAGS.map((t) => {
              const on = draft.tags?.split(',').includes(t.v);
              return (
                <button
                  key={t.v}
                  onClick={() => {
                    const cur = new Set((draft.tags ?? '').split(',').filter(Boolean));
                    on ? cur.delete(t.v) : cur.add(t.v);
                    setDraft({ ...draft, tags: [...cur].join(',') || undefined });
                  }}
                  className={`rounded-full border px-3 py-1.5 text-sm ${on ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-ink-line'}`}
                >
                  {t.l}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-semibold text-ink-700">Saralash</p>
          <div className="flex flex-wrap gap-2">
            {SORTS.map((s) => (
              <button
                key={s.v}
                onClick={() => setDraft({ ...draft, sort: s.v })}
                className={`rounded-full border px-3 py-1.5 text-sm ${draft.sort === s.v ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-ink-line'}`}
              >
                {s.l}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="outline" className="flex-1" onClick={() => setDraft({})}>
            Tozalash
          </Button>
          <Button className="flex-1" onClick={() => { onApply(draft); onClose(); }}>
            Qo‘llash
          </Button>
        </div>
      </div>
    </Sheet>
  );
}
