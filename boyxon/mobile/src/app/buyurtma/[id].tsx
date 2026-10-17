import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { apiErrorMessage } from '../../api/client';
import { ordersApi } from '../../api/orders.api';
import type { ApiOk, Order } from '../../api/types';
import { EmptyState } from '../../components/EmptyState';
import { Icon } from '../../components/Icon';
import { OrderStatusChip } from '../../components/OrderStatusChip';
import { formatDate, formatPrice } from '../../lib/format';
import { isOrderFinal, ORDER_STATUS_INDEX, ORDER_STEPS } from '../../lib/orderStatus';
import { useToastStore } from '../../store/toast.store';
import { useTheme } from '../../theme/ThemeProvider';

const PAY_LABELS: Record<string, string> = {
  payme: 'Payme',
  click: 'Click',
  uzum: 'Uzum Bank',
  cash: 'Naqd pul',
};

/** Buyurtma detali + kuzatuv (trekker) + bekor qilish. */
export default function BuyurtmaScreen() {
  const theme = useTheme();
  const { colors, isDark } = theme;
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const showToast = useToastStore((s) => s.show);
  const queryClient = useQueryClient();
  const [cancelling, setCancelling] = useState(false);

  const orderQ = useQuery({
    queryKey: ['order', id],
    queryFn: () => ordersApi.detail(id as string),
    enabled: !!id,
    refetchInterval: (query) => {
      const st = (query.state.data as ApiOk<Order> | undefined)?.data?.status;
      if (st && isOrderFinal(st)) return false;
      return 30_000;
    },
  });
  const order = orderQ.data?.data;

  const cancelOrder = () => {
    if (!order) return;
    Alert.alert('Buyurtmani bekor qilish', 'Buyurtma bekor qilinadi. Davom etasizmi?', [
      { text: "Yo'q", style: 'cancel' },
      {
        text: 'Bekor qilish',
        style: 'destructive',
        onPress: async () => {
          setCancelling(true);
          try {
            await ordersApi.cancel(order._id);
            await orderQ.refetch();
            queryClient.invalidateQueries({ queryKey: ['my-orders'] });
            showToast('Buyurtma bekor qilindi');
          } catch (e) {
            showToast(apiErrorMessage(e, 'Bekor qilib bo‘lmadi'), 'error');
          } finally {
            setCancelling(false);
          }
        },
      },
    ]);
  };

  const stepIndex = order ? (ORDER_STATUS_INDEX[order.status] ?? 0) : 0;
  const progress = ((stepIndex + 1) / ORDER_STEPS.length) * 100;
  const canCancel = !!order && ['pending', 'confirmed', 'packing'].includes(order.status);

  const card = [styles.card, theme.shadows.card, { backgroundColor: colors.surfaceContainerLowest }];
  const infoRow = (icon: string, label: string, value?: string) => (
    <View style={styles.infoRow} key={label}>
      <View style={[styles.infoIcon, { backgroundColor: colors.surfaceContainerLow }]}>
        <Icon name={icon} size={18} color={colors.primary} />
      </View>
      <View style={styles.flex}>
        <Text style={[theme.typography.bodySm, { color: colors.onSurfaceVariant }]}>{label}</Text>
        {value ? (
          <Text style={[theme.typography.labelLg, { color: colors.onSurface, marginTop: 1 }]}>
            {value}
          </Text>
        ) : null}
      </View>
    </View>
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable
          accessibilityLabel="Orqaga"
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.backBtn,
            { backgroundColor: colors.surfaceContainer, opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <Icon name="arrow_back" size={22} color={colors.onSurface} />
        </Pressable>
        <View style={styles.flex}>
          <Text style={[theme.typography.headlineMd, { color: colors.onSurface }]}>
            Buyurtma
          </Text>
          {order ? (
            <Text style={[theme.typography.labelSm, { color: colors.onSurfaceVariant }]}>
              {order.orderNumber} · {formatDate(order.createdAt)}
            </Text>
          ) : null}
        </View>
        {order ? <OrderStatusChip status={order.status} /> : null}
      </View>

      {orderQ.isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primaryContainer} />
        </View>
      ) : !order ? (
        <EmptyState
          icon="error-outline"
          title="Buyurtma topilmadi"
          subtitle="Buyurtma o'chirilgan yoki mavjud emas"
          actionLabel="Orqaga"
          onAction={() => router.back()}
        />
      ) : (
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: 32 + insets.bottom }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={orderQ.isFetching && !orderQ.isLoading}
              onRefresh={() => void orderQ.refetch()}
              tintColor={colors.primaryContainer}
              colors={[colors.primaryContainer]}
            />
          }
        >
          {order.status === 'cancelled' ? (
            <View style={[styles.banner, { backgroundColor: colors.errorContainer }]}>
              <Icon name="cancel" size={18} color={colors.onErrorContainer} />
              <Text
                style={[
                  theme.typography.labelMd,
                  { color: colors.onErrorContainer, flex: 1 },
                ]}
              >
                Bu buyurtma bekor qilindi
              </Text>
            </View>
          ) : null}

          {/* Trekker */}
          <View style={card}>
            <Text style={[theme.typography.labelLg, { color: colors.onSurface }]}>
              {order.status === 'delivered'
                ? t('orders.trackerDelivered', { defaultValue: 'Buyurtma yetkazildi' })
                : order.status === 'cancelled'
                  ? t('orders.trackerCancelled', { defaultValue: 'Buyurtma bekor qilindi' })
                  : t('orders.trackerActive', { defaultValue: "Buyurtma yo'lda — kuzatib boring" })}
            </Text>
            <View style={styles.tracker}>
              {ORDER_STEPS.map((label, i) => {
                const done = i < stepIndex;
                const current = i === stepIndex;
                return (
                  <View key={label} style={styles.trackerRow}>
                    <View
                      style={[
                        styles.dot,
                        {
                          backgroundColor: done
                            ? colors.tertiaryContainer
                            : current
                              ? colors.primaryContainer
                              : 'transparent',
                          borderWidth: done || current ? 0 : 1.5,
                          borderColor: colors.outlineVariant,
                        },
                      ]}
                    />
                    <Text
                      style={[
                        theme.typography.labelSm,
                        {
                          color: done || current ? colors.onSurface : colors.onSurfaceVariant,
                          fontFamily: current ? 'Inter_600SemiBold' : 'Inter_400Regular',
                        },
                      ]}
                    >
                      {label}
                    </Text>
                  </View>
                );
              })}
              <View style={[styles.progressTrack, { backgroundColor: colors.surfaceContainerHigh }]}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${progress}%`, backgroundColor: colors.primaryContainer },
                  ]}
                />
              </View>
            </View>
            {order.estimatedDeliveryAt && order.status !== 'cancelled' ? (
              <Text
                style={[theme.typography.bodySm, { color: colors.onSurfaceVariant, marginTop: 10 }]}
              >
                {t('orders.eta', { defaultValue: 'Taxminiy yetkazish' })}:{' '}
                {formatDate(order.estimatedDeliveryAt)}
              </Text>
            ) : null}
          </View>

          {/* Tarkib */}
          <View style={card}>
            <Text style={[theme.typography.labelLg, { color: colors.onSurface, marginBottom: 10 }]}>
              Buyurtma tarkibi
            </Text>
            {order.items.map((it, idx) => (
              <View
                key={`${it.dish}-${idx}`}
                style={[
                  styles.itemRow,
                  idx > 0 ? { borderTopWidth: 1, borderTopColor: colors.surfaceContainerLow } : null,
                ]}
              >
                <Text
                  numberOfLines={1}
                  style={[theme.typography.bodyMd, { color: colors.onSurface, flex: 1 }]}
                >
                  {it.name}
                </Text>
                <Text style={[theme.typography.labelSm, { color: colors.onSurfaceVariant }]}>
                  ×{it.quantity}
                </Text>
                <Text
                  style={[
                    theme.typography.labelLg,
                    { color: colors.onSurface, marginLeft: 12, minWidth: 84, textAlign: 'right' },
                  ]}
                >
                  {formatPrice(it.price * it.quantity)}
                </Text>
              </View>
            ))}
          </View>

          {/* Yetkazish ma'lumoti */}
          <View style={[card, styles.infoGap]}>
            {infoRow(
              order.deliveryType === 'pickup' ? 'directions_walk' : 'two_wheeler',
              t('cart.delivery', { defaultValue: 'Yetkazib berish' }),
              order.deliveryType === 'pickup' ? 'Olib ketish' : 'Yetkazib berish',
            )}
            {order.address?.address
              ? infoRow(
                  'location_on',
                  'Manzil',
                  `${order.address.label ? order.address.label + ' · ' : ''}${order.address.address}`,
                )
              : null}
            {infoRow('credit_card', "To'lov usuli", PAY_LABELS[order.paymentMethod] ?? order.paymentMethod)}
            {order.promoCode
              ? infoRow('local_offer', 'Promo kod', `${order.promoCode} · -${formatPrice(order.discount)}`)
              : null}
            {order.notes ? infoRow('sticky_note_2', 'Izoh', order.notes) : null}
          </View>

          {/* Taksi ma'lumoti */}
          {order.taxi?.driver ? (
            <View style={[card, styles.infoGap]}>
              {infoRow(
                'local_taxi',
                'Kuryer',
                `${order.taxi.driver}${order.taxi.carNumber ? ' · ' + order.taxi.carNumber : ''}${
                  order.taxi.service ? ' · ' + order.taxi.service : ''
                }`,
              )}
            </View>
          ) : null}

          {/* Hisob-kitob */}
          <View style={[card, styles.infoGap]}>
            <View style={styles.sumRow}>
              <Text style={[theme.typography.bodyMd, { color: colors.onSurfaceVariant }]}>
                {t('orders.subtotal', { defaultValue: 'Taomlar narxi' })}
              </Text>
              <Text style={[theme.typography.labelLg, { color: colors.onSurface }]}>
                {formatPrice(order.subtotal)}
              </Text>
            </View>
            <View style={styles.sumRow}>
              <Text style={[theme.typography.bodyMd, { color: colors.onSurfaceVariant }]}>
                Yetkazib berish
              </Text>
              <Text
                style={[
                  theme.typography.labelLg,
                  { color: order.deliveryFee > 0 ? colors.onSurface : colors.tertiary },
                ]}
              >
                {order.deliveryFee > 0 ? formatPrice(order.deliveryFee) : 'Bepul'}
              </Text>
            </View>
            {order.discount > 0 ? (
              <View style={styles.sumRow}>
                <Text style={[theme.typography.bodyMd, { color: colors.onSurfaceVariant }]}>
                  Chegirma
                </Text>
                <Text style={[theme.typography.labelLg, { color: colors.tertiary }]}>
                  -{formatPrice(order.discount)}
                </Text>
              </View>
            ) : null}
            <View style={[styles.divider, { backgroundColor: colors.surfaceContainerHigh }]} />
            <View style={styles.sumRow}>
              <Text
                style={[
                  theme.typography.headlineSm,
                  { color: colors.onSurface, fontFamily: 'Epilogue_600SemiBold', fontSize: 18 },
                ]}
              >
                {t('orders.total', { defaultValue: "Jami to'lov" })}
              </Text>
              <Text
                style={[
                  theme.typography.headlineSm,
                  { color: colors.primary, fontFamily: 'Epilogue_600SemiBold', fontSize: 18 },
                ]}
              >
                {formatPrice(order.total)}
              </Text>
            </View>
          </View>

          {canCancel ? (
            <Pressable
              onPress={cancelling ? undefined : cancelOrder}
              style={({ pressed }) => [
                styles.cancelBtn,
                { borderColor: colors.error, opacity: pressed || cancelling ? 0.7 : 1 },
              ]}
            >
              <Icon name="cancel" size={18} color={colors.error} />
              <Text style={[theme.typography.labelLg, { color: colors.error, fontFamily: 'Inter_500Medium' }]}>
                {cancelling ? 'Bekor qilinmoqda...' : 'Buyurtmani bekor qilish'}
              </Text>
            </Pressable>
          ) : null}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1, minWidth: 0 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingHorizontal: 16, paddingTop: 12, gap: 12 },
  card: { borderRadius: 12, padding: 16 },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    padding: 12,
  },
  tracker: { marginTop: 12, gap: 10 },
  trackerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  progressTrack: { height: 6, borderRadius: 3, overflow: 'hidden', marginTop: 4 },
  progressFill: { height: '100%', borderRadius: 3 },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  infoGap: { gap: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sumRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  divider: { height: 1, marginVertical: 4 },
  cancelBtn: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
});
