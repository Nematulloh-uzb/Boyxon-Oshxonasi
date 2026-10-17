import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import type { AppNotification } from '../api/types';
import { usersApi } from '../api/users.api';
import { EmptyState } from '../components/EmptyState';
import { Icon } from '../components/Icon';
import { formatDate } from '../lib/format';
import { useAuthStore } from '../store/auth.store';
import { useTheme } from '../theme/ThemeProvider';

const TYPE_ICONS: Record<string, string> = {
  order: 'receipt_long',
  promo: 'celebration',
  bonus: 'stars',
  system: 'notifications',
  new_dish: 'restaurant',
};

/** Bildirishnomalar — Stitch tilida ro'yxat. */
export default function BildirishnomalarScreen() {
  const theme = useTheme();
  const { colors, isDark } = theme;
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);

  const q = useQuery({
    queryKey: ['notifications'],
    queryFn: () => usersApi.myNotifications(1, 40),
    enabled: !!user,
  });
  const items: AppNotification[] = q.data?.data ?? [];

  const renderItem = ({ item }: { item: AppNotification }) => (
    <View
      style={[
        styles.card,
        theme.shadows.card,
        { backgroundColor: colors.surfaceContainerLowest },
      ]}
    >
      <View style={[styles.iconBox, { backgroundColor: colors.surfaceContainerLow }]}>
        <Icon name={TYPE_ICONS[item.type] ?? 'notifications'} size={20} color={colors.primary} />
      </View>
      <View style={styles.body}>
        <Text numberOfLines={1} style={[theme.typography.labelLg, { color: colors.onSurface }]}>
          {item.title}
        </Text>
        <Text
          numberOfLines={2}
          style={[theme.typography.bodySm, { color: colors.onSurfaceVariant, marginTop: 2 }]}
        >
          {item.message}
        </Text>
        <Text style={[theme.typography.labelSm, { color: colors.outline, marginTop: 4 }]}>
          {formatDate(item.createdAt)}
        </Text>
      </View>
      {!item.isRead ? <View style={[styles.dot, { backgroundColor: colors.primaryContainer }]} /> : null}
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
        <Text style={[theme.typography.headlineMd, { color: colors.onSurface, flex: 1, marginLeft: 12 }]}>
          {t('notifications.title', { defaultValue: 'Bildirishnomalar' })}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {!user ? (
        <EmptyState
          icon="lock"
          title="Kirish kerak"
          subtitle="Bildirishnomalarni ko'rish uchun hisobingizga kiring"
          actionLabel="Kirish"
          onAction={() => router.push('/kirish')}
        />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(n) => n._id}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
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
                icon="notifications_none"
                title="Bildirishnomalar yo'q"
                subtitle="Buyurtma holati va aksiyalar haqida shu yerda xabar beramiz"
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
    alignItems: 'flex-start',
    gap: 12,
    borderRadius: 12,
    padding: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, minWidth: 0 },
  dot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
  loading: { paddingVertical: 48, alignItems: 'center' },
});
