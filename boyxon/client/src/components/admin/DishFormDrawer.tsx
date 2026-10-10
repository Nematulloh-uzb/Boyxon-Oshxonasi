import { useEffect, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { toast } from 'sonner';
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
    if (!f.type.startsWith('image/')) return toast.error('Faqat rasm');
    if (f.size > 5 * 1024 * 1024) return toast.error('5 MB dan kichik bo‘lsin');
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const submit = async (): Promise<void> => {
    if (!form.name.trim() || !form.description.trim() || !form.price || !form.category) {
      return toast.error('Majburiy maydonlarni to‘ldiring');
    }
    setSaving(true);
    try {
      const body = { ...form };
      if (dish) await adminApi.updateDish(dish._id, body, file);
      else await adminApi.createDish(body, file);
      toast.success(dish ? 'Taom yangilandi' : 'Taom yaratildi');
      onSaved();
      onClose();
    } catch (e) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Xatolik';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };
