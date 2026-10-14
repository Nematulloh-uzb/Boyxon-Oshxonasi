import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ordersApi } from '../../api/orders.api';
import { formatPrice, formatDate } from '../../lib/format';
import { Button } from '../../components/ui/Button';
import { Loader2 } from 'lucide-react';
import type { Order } from '../../types';

export default function OrderDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    if (!id) {
      setError(t('orders.invalid_id'));
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    // Egalik tekshiruvi SERVERDA (getOrder: 403) — bu yerda ortiqcha
    // client-side check yo'q: user store hali yuklanmagan bo'lsa ham
    // noto'g'ri "Unauthorized" chiqmasligi kerak.
    ordersApi
      .detail(id)
      .then((res) => {
        if (alive) setOrder(res.data);
      })
      .catch((err) => {
        const status = (err as { response?: { status?: number } })?.response?.status;
        if (alive) setError(status === 403 ? t('orders.unauthorized') : t('orders.load_error'));
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [id, t]);

  const goBack = (): void => {
    if (window.history.length > 1) nav(-1);
    else nav('/settings');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-bg p-6 text-center">
        <p className="text-danger">{error}</p>
        <Button variant="outline" onClick={goBack}>{t('common.back')}</Button>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-bg p-6 text-center">
        <p className="text-danger">{t('orders.not_found')}</p>
        <Button variant="outline" onClick={goBack}>{t('common.back')}</Button>
      </div>
    );
  }

  const customer = typeof order.user === 'object' && order.user !== null ? order.user : null;

  return (
    <div className="min-h-screen bg-bg p-6">
      <div className="max-w-xl mx-auto bg-surface rounded-card shadow-sm p-6">
        <div className="flex justify-between items-start gap-3 mb-4">
          <h1 className="font-display text-xl font-extrabold">{t('orders.detail_title')}</h1>
          <Button variant="outline" onClick={goBack}>{t('common.back')}</Button>
        </div>

        <div className="space-y-4">
          {/* Order number and date */}
          <div className="text-right text-sm text-ink-500">
            <p>{t('orders.order_number')}:</p>
            <p className="font-semibold">{order.orderNumber}</p>
          </div>
          <div className="text-right text-sm text-ink-500">
            <p>{t('orders.date')}:</p>
            <p className="font-semibold">{formatDate(order.createdAt)}</p>
          </div>

          {/* Customer info */}
          <div className="border-t border-ink-line/60 pt-4">
            <p className="font-semibold text-ink-900 mb-2">{t('orders.customer_info')}</p>
            <div className="space-y-1 text-sm">
              <p><strong>{t('common.name')}:</strong> {typeof order.user === 'object' ? order.user.name : '—'}</p>
              <p><strong>{t('common.phone')}:</strong> {typeof order.user === 'object' ? order.user.phone : '—'}</p>
            </div>
          </div>

          {/* Items */}
          <div className="border-t border-ink-line/60 pt-4">
            <p className="font-semibold text-ink-900 mb-2">{t('orders.items')}</p>
            <div className="space-y-2">
              {order.items.map((item: any) => (
                <div key={item._id} className="flex justify-between text-sm">
                  <span>{item.name}</span>
                  <span>{item.quantity} × {formatPrice(item.price)} = {formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="border-t border-ink-line/60 pt-4">
            <p className="font-semibold text-ink-900 mb-2">{t('orders.totals')}</p>
            <div className="space-y-1 text-sm">
              <p><strong>{t('orders.subtotal')}:</strong> {formatPrice(order.subtotal)}</p>
              {order.discount > 0 && (
                <p><strong>{t('orders.discount')}:</strong> -{formatPrice(order.discount)}</p>
              )}
              {order.deliveryFee > 0 && (
                <p><strong>{t('orders.delivery_fee')}:</strong> {formatPrice(order.deliveryFee)}</p>
              )}
              <div className="border-t border-ink-line/40 pt-2 pb-2">
                <p className="font-bold text-xl">{t('orders.total')}:</p>
                <p className="font-bold text-xl text-primary-600">{formatPrice(order.total)}</p>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="border-t border-ink-line/60 pt-4">
            <p className="font-semibold text-ink-900 mb-2">{t('orders.status')}</p>
            <p className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusClass(order.status)}`}>
              {t(`status.${order.status}`)}
            </p>
          </div>

          {/* Address (if delivery) */}
          {order.deliveryType === 'delivery' && order.address && (
            <div className="border-t border-ink-line/60 pt-4">
              <p className="font-semibold text-ink-900 mb-2">{t('orders.address')}</p>
              <div className="space-y-1 text-sm">
                <p><strong>{t('common.label')}:</strong> {order.address.label}</p>
                <p><strong>{t('common.address')}:</strong> {order.address.address}</p>
              </div>
            </div>
          )}

          {/* Payment method */}
          <div className="border-t border-ink-line/60 pt-4">
            <p className="font-semibold text-ink-900 mb-2">{t('orders.payment_method')}</p>
            <p className="text-sm">{formatPaymentMethod(order.paymentMethod)}</p>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="border-t border-ink-line/60 pt-4">
              <p className="font-semibold text-ink-900 mb-2">{t('orders.notes')}</p>
              <p className="text-sm text-ink-500">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getStatusClass(status: string): string {
  switch (status) {
    case 'pending': return 'bg-surface-raised text-ink-700';
    case 'confirmed': return 'bg-primary-100 text-primary-700';
    case 'packing': return 'bg-primary-50 text-primary-700';
    case 'handed_to_taxi': return 'bg-primary-100 text-primary-700';
    case 'delivered': return 'bg-success/10 text-success';
    case 'cancelled': return 'bg-danger/10 text-danger';
    default: return 'bg-surface text-ink-700';
  }
}

function formatPaymentMethod(method: string): string {
  switch (method) {
    case 'payme': return 'Payme';
    case 'click': return 'Click';
    case 'uzum': return 'Uzum';
    case 'cash': return 'Naqd';
    default: return method;
  }
}