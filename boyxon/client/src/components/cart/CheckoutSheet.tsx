import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { Sheet } from '../ui/Sheet';
import { Button } from '../ui/Button';
import { DeliveryToggle } from './DeliveryToggle';
import { PaymentMethods } from './PaymentMethods';
import { PromoInput } from './PromoInput';
import { CartSummary } from './CartSummary';
import { useCart } from '../../hooks/useCart';
import { useAuthStore } from '../../store/auth.store';
import { useUiStore } from '../../store/ui.store';
import { ordersApi } from '../../api/orders.api';
import { DELIVERY_FEE, FREE_DELIVERY_FROM } from '../../lib/constants';
import type { Order } from '../../types';

export function CheckoutSheet() {
  const { checkoutOpen, set } = useUiStore();
  const { lines, subtotal, discount, promoCode, clear } = useCart();
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();
  const nav = useNavigate();

  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [addressId, setAddressId] = useState<string>(
    user?.addresses.find((a) => a.isDefault)?._id ?? user?.addresses[0]?._id ?? '',
  );
  const [notes, setNotes] = useState('');
  const [created, setCreated] = useState<Order | null>(null);

  const addresses = user?.addresses ?? [];
  const deliveryFee = deliveryType === 'pickup' || subtotal >= FREE_DELIVERY_FROM ? 0 : DELIVERY_FEE;
  const total = Math.max(0, subtotal + deliveryFee - discount);

  const mutation = useMutation({
    mutationFn: () => {
      const addr = addresses.find((a) => a._id === addressId);
      return ordersApi.create({
        items: lines.map((l) => ({ dish: l.dishId, quantity: l.quantity })),
        deliveryType,
        address: deliveryType === 'delivery' && addr ? { label: addr.label, address: addr.address } : undefined,
        paymentMethod: paymentMethod as 'payme' | 'click' | 'uzum' | 'cash',
        promoCode,
        notes: notes || undefined,
      });
    },
    onSuccess: (r) => {
      setCreated(r.data);
      clear();
      void qc.invalidateQueries({ queryKey: ['notifications'] });
      void qc.invalidateQueries({ queryKey: ['unread-count'] });
      toast.success('Buyurtmangiz qabul qilindi!');
    },
    onError: (e) => {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Xatolik yuz berdi';
      toast.error(msg);
    },
  });

  const close = (): void => {
    setCreated(null);
    set({ checkoutOpen: false });
    if (mutation.isSuccess) nav('/');
  };

  if (created) {
    return (
      <Sheet open={checkoutOpen} onClose={close} title="Buyurtma qabul qilindi">
        <div className="py-6 text-center">
          <CheckCircle2 className="mx-auto h-16 w-16 text-success" />
          <p className="mt-4 font-display text-xl font-bold">{created.orderNumber}</p>
          <p className="mt-1 text-sm text-ink-300">Statusni real-time kuzatib boring.</p>
          <div className="mt-6 flex gap-3">
            <Button variant="outline" className="flex-1" onClick={close}>Bosh sahifa</Button>
            <Button className="flex-1" onClick={close}>Buyurtmalarim</Button>
          </div>
        </div>
      </Sheet>
    );
  }

  return (
    <Sheet open={checkoutOpen} onClose={() => set({ checkoutOpen: false })} title="Buyurtmani rasmiylashtirish">
      <div className="space-y-5">
        <DeliveryToggle value={deliveryType} onChange={setDeliveryType} />

        {deliveryType === 'delivery' && (
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-ink-700">Manzil</label>
            {addresses.length ? (
              <div className="flex flex-col gap-2">
                {addresses.map((a) => (
                  <button
                    key={a._id}
                    onClick={() => setAddressId(a._id ?? '')}
                    className={`rounded-2xl border px-3 py-3 text-left text-sm ${addressId === a._id ? 'border-primary-500 bg-primary-50' : 'border-ink-line'}`}
                  >
                    <span className="font-semibold">{a.label}</span>
                    <span className="mt-0.5 block text-ink-300">{a.address}</span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="rounded-2xl bg-[#FFF3E0] px-3 py-3 text-sm text-ink-500">
                Manzil yo‘q — Sozlamalar orqali qo‘shing yoki “Olib ketish” ni tanlang.
              </p>
            )}
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-ink-700">To‘lov usuli</label>
          <PaymentMethods value={paymentMethod} onChange={setPaymentMethod} />
        </div>

        <PromoInput />

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-ink-700">Izoh (ixtiyoriy)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Masalan: qo‘shimcha dasturxon..."
            className="w-full rounded-2xl border border-ink-line bg-white px-3 py-2.5 text-sm outline-none focus:border-primary-500"
          />
        </div>

        <CartSummary subtotal={subtotal} deliveryFee={deliveryFee} discount={discount} total={total} />

        <Button
          className="w-full"
          size="lg"
          disabled={!lines.length || mutation.isPending || (deliveryType === 'delivery' && !addressId)}
          onClick={() => mutation.mutate()}
        >
          {mutation.isPending ? 'Yuborilmoqda...' : 'To‘lovni tasdiqlash'}
        </Button>
      </div>
    </Sheet>
  );
}

