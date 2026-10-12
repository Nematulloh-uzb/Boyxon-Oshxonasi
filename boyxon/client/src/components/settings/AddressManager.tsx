import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Home, MapPin, Plus, Star, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { usersApi } from '../../api/users.api';
import { useAuthStore } from '../../store/auth.store';
import type { Address } from '../../types';

/**
 * Sozlamalar → Manzillarim.
 * Manzil CRUD (qo'shish / asosiy qilish / o'chirish) — checkout shu ro'yxatdan o'qiydi.
 * Har bir muvaffaqiyatli amaldan keyin auth store'dagi user.addresses yangilanadi.
 */
export function AddressManager() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const qc = useQueryClient();

  const [label, setLabel] = useState('');
  const [address, setAddress] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [adding, setAdding] = useState(false);

  const addresses = user?.addresses ?? [];

  /** Serverdan qaytgan yangi manzillar ro'yxatini store + cache ga yozadi. */
  const applyAddresses = (list: Address[]): void => {
    if (user) setUser({ ...user, addresses: list });
    void qc.invalidateQueries({ queryKey: ['me'] });
  };

  const onError = (): void => toast.error(t('settings.save_error'));

  const addM = useMutation({
    mutationFn: () => usersApi.addAddress({ label: label.trim(), address: address.trim(), isDefault }),
    onSuccess: (r) => {
      applyAddresses(r.data);
      setLabel('');
      setAddress('');
      setIsDefault(false);
      setAdding(false);
      toast.success(t('settings.address_added'));
    },
    onError,
  });

  const defaultM = useMutation({
    mutationFn: (id: string) => usersApi.updateAddress(id, { isDefault: true }),
    onSuccess: (r) => {
      applyAddresses(r.data);
      toast.success(t('settings.saved'));
    },
    onError,
  });

  const deleteM = useMutation({
    mutationFn: (id: string) => usersApi.deleteAddress(id),
    onSuccess: (r) => {
      applyAddresses(r.data);
      toast.success(t('settings.address_deleted'));
    },
    onError,
  });

  const submitAdd = (): void => {
    if (!label.trim() || !address.trim()) {
      toast.error(t('settings.address_required'));
      return;
    }
    addM.mutate();
  };
