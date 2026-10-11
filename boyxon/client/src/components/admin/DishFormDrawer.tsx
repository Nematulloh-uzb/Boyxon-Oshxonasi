import { useEffect, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { Sheet } from '../ui/Sheet';
import { Button } from '../ui/Button';
import { adminApi } from '../../api/admin.api';
import type { Category, Dish } from '../../types';

interface Props {
  open: boolean;
  onClose: () => void;
  dish?: Dish | null;
  categories: Category[];
  onSaved: () => void;
}

const empty = {
  name: '', description: '', price: '', oldPrice: '', category: '',
  deliveryTime: '30', tags: '', isActive: 'true', isFeatured: 'false',
};

export function DishFormDrawer({ open, onClose, dish, categories, onSaved }: Props) {
  const { t } = useTranslation();
  const [form, setForm] = useState(empty);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [drag, setDrag] = useState(false);

  useEffect(() => {
    if (!open) return;
    setFile(null);
    setPreview(null);
    if (dish) {
      setForm({
        name: dish.name,
        description: dish.description,
        price: String(dish.price),
        oldPrice: dish.oldPrice ? String(dish.oldPrice) : '',
        category: typeof dish.category === 'object' ? dish.category._id : String(dish.category),
        deliveryTime: String(dish.deliveryTime),
        tags: dish.tags.join(', '),
        isActive: String(dish.isActive),
        isFeatured: String(dish.isFeatured),
      });
      setPreview(dish.image);
    } else {
      setForm({ ...empty, category: categories[0]?._id ?? '' });
    }
  }, [open, dish, categories]);

  const pick = (f?: File | null): void => {
    if (!f) return;
    if (!f.type.startsWith('image/')) { toast.error(t('admin.only_image')); return; }
    if (f.size > 5 * 1024 * 1024) { toast.error(t('admin.image_too_large')); return; }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const submit = async (): Promise<void> => {
    if (!form.name.trim() || !form.description.trim() || !form.price || !form.category) {
      toast.error(t('admin.fill_required'));
      return;
    }
    setSaving(true);
    try {
      const body = { ...form };
      if (dish) await adminApi.updateDish(dish._id, body, file);
      else await adminApi.createDish(body, file);
      toast.success(dish ? t('admin.dish_updated') : t('admin.dish_created'));
      onSaved();
      onClose();
    } catch (e) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? t('common.error');
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const inputCls = 'h-11 w-full rounded-xl border border-ink-line px-3 text-sm outline-none focus:border-primary-500';

  return (
    <Sheet open={open} onClose={onClose} title={dish ? 'Taomni tahrirlash' : 'Yangi taom'}>
      <div className="space-y-3">
        {/* Rasm dropzone — ixtiyoriy */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files?.[0]); }}
          onClick={() => document.getElementById('dish-img')?.click()}
          className={`relative flex h-40 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed transition ${
            drag ? 'border-primary-500 bg-primary-50' : 'border-ink-line bg-muted'
          }`}
        >
          {preview ? (
            <>
              <img src={preview} alt="preview" className="h-full w-full object-cover" />
              <span className="absolute right-2 top-2 rounded-full bg-surface/90 p-1.5 text-ink-700 shadow"
                onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(dish?.image ?? null); }}>
                <X className="h-4 w-4" />
              </span>
            </>
          ) : (
            <div className="text-center text-ink-300">
              <ImagePlus className="mx-auto h-8 w-8" />
              <p className="mt-1 text-xs">Rasm yuklang (ixtiyoriy) yoki tashlang</p>
              <p className="text-[10px]">bo‘lsa — “Rasm yo‘q” placeholder ko‘rinadi</p>
            </div>
          )}
          <input id="dish-img" type="file" accept="image/*" className="hidden" onChange={(e) => pick(e.target.files?.[0])} />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-ink-700">Nomi *</label>
          <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-ink-700">Tavsif *</label>
          <textarea rows={3} className={`${inputCls} h-auto py-2`} value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-ink-700">Narx (so‘m) *</label>
            <input type="number" className={inputCls} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-ink-700">Eski narx</label>
            <input type="number" className={inputCls} value={form.oldPrice} onChange={(e) => setForm({ ...form, oldPrice: e.target.value })} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-ink-700">Kategoriya *</label>
            <select className={inputCls} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option value="">Tanlang</option>
              {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-ink-700">Yetkazish (daq)</label>
            <input type="number" className={inputCls} value={form.deliveryTime} onChange={(e) => setForm({ ...form, deliveryTime: e.target.value })} />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-ink-700">Teglar (vergul bilan)</label>
          <input className={inputCls} placeholder="top, vegetarian" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
        </div>
        <div className="flex gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isActive === 'true'} onChange={(e) => setForm({ ...form, isActive: String(e.target.checked) })} />
            Faol
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isFeatured === 'true'} onChange={(e) => setForm({ ...form, isFeatured: String(e.target.checked) })} />
            Tanlangan (featured)
          </label>
        </div>
        <Button className="w-full" onClick={() => void submit()} disabled={saving}>
          {saving ? 'Saqlanmoqda...' : dish ? 'Saqlash' : 'Yaratish'}
        </Button>
      </div>
    </Sheet>
  );
}
