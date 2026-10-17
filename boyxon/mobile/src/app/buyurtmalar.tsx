import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { ordersApi } from '../api/orders.api';
import type { Order } from '../api/types';
import { EmptyState } from '../components/EmptyState';
import { Icon } from '../components/Icon';
import { OrderStatusChip } from '../components/OrderStatusChip';
import { formatDate, formatPrice } from '../lib/format';
import { useAuthStore } from '../store/auth.store';
import { useTheme } from '../theme/ThemeProvider';

/** Buyurtmalar tarixi — Stitch tilida ro'yxat. */
export default function BuyurtmalarScreen() {
  const theme = useTheme();
  const { colors, isDark } = theme;
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);

  const q = useQuery({
    queryKey: ['my-orders', 'list'],
    queryFn: () => ordersApi.myOrders(1, 30),
    enabled: !!user,
  });
  const orders: Order[] = q.data?.data ?? [];

  const renderItem = ({ item }: { item: Order }) => (
    <Pressable
      onPress={() => router.push({ pathname: '/buyurtma/[id]', params: { id: item._id } })}
      style={({ pressed }) => [
        styles.card,
        theme.shadows.card,
        { backgroundColor: colors.surfaceContainerLowest, opacity: pressed ? 0.95 : 1 },
      ]}
    >
      <View style={[styles.iconBox, { backgroundColor: colors.surfaceContainerLow }]}>
        <Icon name="receipt_long" size={22} color={colors.primary} />
      </View>
      <View style={styles.cardBody}>
        <Text style={[theme.typography.labelLg, { color: colors.onSurface }]}>
          {item.orderNumber}
        </Text>
        <Text style={[theme.typography.bodySm, { color: colors.onSurfaceVariant, marginTop: 2 }]}>
          {formatDate(item.createdAt)} ·{' '}
          {t('orders.items_count', {
            count: item.items.length,
            defaultValue: `${item.items.length} ta taom`,
          })}
        </Text>
      </View>
      <View style={styles.cardRight}>
        <OrderStatusChip status={item.status} />
        <Text
          style={[
            theme.typography.labelLg,
            { color: colors.primary, fontFamily: 'Inter_600SemiBold', marginTop: 6 },
          ]}
        >
          {formatPrice(item.total)}
        </Text>
      </View>
    </Pressable>
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
        <Text style={[theme.typography.headlineMd, { color: colors.onSurface, flex: 1, marginLeft: 12 }]}>
          {t('orders.title', { defaultValue: 'Buyurtmalarim' })}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {!user ? (
        <EmptyState
          icon="lock"
          title="Kirish kerak"
          subtitle="Buyurtmalar tarixini ko'rish uchun hisobingizga kiring"
          actionLabel="Kirish"
          onAction={() => router.push('/kirish')}
        />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(o) => o._id}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          contentContainerStyle={[styles.list, { paddingBottom: 24 + insets.bottom }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={q.isFetching && !q.isLoading}
              onRefresh={() => void q.refetch()}
              tintColor={colors.primaryContainer}
              colors={[colors.primaryContainer]}
            />
          }
          ListEmptyComponent={
            q.isLoading ? (
              <View style={styles.loading}>
                <ActivityIndicator size="large" color={colors.primaryContainer} />
              </View>
            ) : (
              <EmptyState
                icon="receipt_long"
                title="Buyurtmalar yo'q"
                subtitle="Hozircha buyurtma bermagansiz — taomlarni tanlab boshlang"
                actionLabel="Xaridni boshlash"
                onAction={() => router.replace('/(tabs)')}
              />
            )
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
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
  list: { paddingHorizontal: 16, paddingTop: 12 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 12,
    padding: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: { flex: 1, minWidth: 0 },
  cardRight: { alignItems: 'flex-end' },
  loading: { paddingVertical: 48, alignItems: 'center' },
});
