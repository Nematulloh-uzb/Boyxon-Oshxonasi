import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { adminApi } from '../../api/admin.api';
import { apiErrorMessage } from '../../api/client';
import type { Dish, Order, OrderStatus, User } from '../../api/types';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { Icon } from '../../components/Icon';
import { SegmentedControl } from '../../components/SegmentedControl';
import { formatPrice } from '../../lib/format';
import { getInitials } from '../../lib/initials';
import { useAuthStore } from '../../store/auth.store';
import { useToastStore } from '../../store/toast.store';
import { useTheme } from '../../theme/ThemeProvider';

/* ---------- yordamchilar ---------- */

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'hozir';
  if (min < 60) return `${min} daq oldin`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} soat oldin`;
  return `${Math.floor(h / 24)} kun oldin`;
}

function isFresh(iso: string): boolean {
  return Date.now() - new Date(iso).getTime() < 5 * 60000;
}

const PAY_LABELS: Record<string, string> = {
  payme: 'Payme',
  click: 'Click',
  uzum: 'Uzum Bank',
  cash: 'Naqd pul',
};

type FilterKey = 'all' | 'pending' | 'packing' | 'handed_to_taxi' | 'delivered';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'Hammasi' },
  { key: 'pending', label: 'Yangi' },
  { key: 'packing', label: 'Tayyorlanmoqda' },
  { key: 'handed_to_taxi', label: "Yo'lda" },
  { key: 'delivered', label: 'Yetkazildi' },
];

/** Toggle — sozlamalardagi bilan bir xil ko'rinish. */
function Toggle({
  value,
  onChange,
  activeColor,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  activeColor: string;
}) {
  const theme = useTheme();
  const { colors } = theme;
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      onPress={() => onChange(!value)}
      style={[
        styles.toggleTrack,
        { backgroundColor: value ? activeColor : colors.surfaceContainerHighest },
      ]}
    >
      <View
        style={[
          styles.toggleThumb,
          { backgroundColor: colors.surface, transform: [{ translateX: value ? 20 : 0 }] },
        ]}
      />
    </Pressable>
  );
}

/* ---------- ekran ---------- */

/** 05 — Admin boshqaruv paneli (Stitch: 05_Admin_Boshqaruv_Paneli). */
export default function AdminScreen() {
  const theme = useTheme();
  const { colors } = theme;
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const qc = useQueryClient();
  const showToast = useToastStore((s) => s.show);
  const user = useAuthStore((s) => s.user);

  const [filter, setFilter] = useState<FilterKey>('all');
  const [search, setSearch] = useState('');
  const [detail, setDetail] = useState<Order | null>(null);
  const [pushOpen, setPushOpen] = useState(false);
  const [pushTitle, setPushTitle] = useState('');
  const [pushMessage, setPushMessage] = useState('');
  const [audience, setAudience] = useState<'all' | 'active' | 'new'>('all');

  const isAdmin = user?.role === 'admin';

  const statsQ = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: adminApi.stats,
    enabled: isAdmin,
    refetchInterval: 60000,
  });

  const ordersQ = useQuery({
    queryKey: ['admin', 'orders', filter],
    queryFn: () => adminApi.orders({ status: filter === 'all' ? undefined : filter, limit: 30 }),
    enabled: isAdmin,
    refetchInterval: 30000,
  });

  const couriersQ = useQuery({
    queryKey: ['admin', 'orders', 'couriers'],
    queryFn: () => adminApi.orders({ status: 'handed_to_taxi', limit: 10 }),
    enabled: isAdmin,
    refetchInterval: 60000,
  });

  const dishesQ = useQuery({
    queryKey: ['admin', 'dishes'],
    queryFn: () => adminApi.dishes({ limit: 50 }),
    enabled: isAdmin,
  });

  const statusMut = useMutation({
    mutationFn: (vars: { id: string; status: OrderStatus }) =>
      adminApi.updateOrderStatus(vars.id, vars.status),
    onSuccess: (res) => {
      showToast(res.message || 'Yangilandi');
      void qc.invalidateQueries({ queryKey: ['admin'] });
    },
    onError: (e) => showToast(apiErrorMessage(e), 'error'),
  });

  const toggleMut = useMutation({
    mutationFn: (id: string) => adminApi.toggleDish(id),
    onSuccess: (res) => {
      showToast(res.message);
      void qc.invalidateQueries({ queryKey: ['admin', 'dishes'] });
      void qc.invalidateQueries({ queryKey: ['dishes'] });
    },
    onError: (e) => showToast(apiErrorMessage(e), 'error'),
  });

  const pushMut = useMutation({
    mutationFn: () =>
      adminApi.sendPush({ title: pushTitle.trim(), message: pushMessage.trim(), audience }),
    onSuccess: (res) => {
      showToast(res.message);
      setPushOpen(false);
      setPushTitle('');
      setPushMessage('');
    },
    onError: (e) => showToast(apiErrorMessage(e), 'error'),
  });

  const stats = statsQ.data?.data;
  const orders = useMemo(() => {
    const rows = ordersQ.data?.data ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((o) => {
      const cust = typeof o.user === 'object' ? (o.user as User) : null;
      return (
        o.orderNumber.toLowerCase().includes(q) ||
        (cust?.name ?? '').toLowerCase().includes(q) ||
        (cust?.phone ?? '').toLowerCase().includes(q)
      );
    });
  }, [ordersQ.data, search]);

  const dishes = (dishesQ.data?.data ?? []).slice(0, 6);
  const couriers = couriersQ.data?.data ?? [];
  const refreshing = ordersQ.isFetching && !ordersQ.isLoading;

  const refreshAll = () => {
    void statsQ.refetch();
    void ordersQ.refetch();
    void couriersQ.refetch();
    void dishesQ.refetch();
  };

  const changeStatus = (order: Order, status: OrderStatus, confirm?: string) => {
    if (confirm) {
      Alert.alert('Bekor qilish', confirm, [
        { text: "Yo'q", style: 'cancel' },
        {
          text: 'Bekor qilish',
          style: 'destructive',
          onPress: () => statusMut.mutate({ id: order._id, status }),
        },
      ]);
      return;
    }
    statusMut.mutate({ id: order._id, status });
  };

  if (!isAdmin) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <StatusBar style={theme.isDark ? 'light' : 'dark'} />
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
            Admin panel
          </Text>
        </View>
        <EmptyState
          icon="lock"
          title="Ruxsat yo'q"
          subtitle="Bu bo'lim faqat administratorlar uchun"
          actionLabel="Orqaga"
          onAction={() => router.back()}
        />
      </View>
    );
  }

  /* ---- karta uslublari ---- */
  const card = [
    styles.card,
    theme.shadows.card,
    { backgroundColor: colors.surfaceContainerLowest },
  ] as const;
  const iconBox = (bg: string, fg: string) =>
    ({ backgroundColor: bg, color: fg }) as unknown; // yordamchi emas — pastda ishlatilgan joyda to'g'ridan-to'g'ri

  void iconBox;

  const chip = (
    bg: string,
    fg: string,
    label: string,
    icon?: string,
  ) => (
    <View style={[styles.kpiChip, { backgroundColor: bg }]}>
      {icon ? <Icon name={icon} size={11} color={fg} /> : null}
      <Text style={[theme.typography.labelSm, { color: fg, fontSize: 10, fontFamily: 'Inter_600SemiBold' }]}>
        {label}
      </Text>
    </View>
  );

  const statusChip = (order: Order) => {
    const map: Record<
      OrderStatus,
      { bg: string; fg: string; label: string; icon?: string }
    > = {
      pending: {
        bg: colors.errorContainer,
        fg: colors.onErrorContainer,
        label: 'Tasdiqlash kutilmoqda',
      },
      confirmed: {
        bg: colors.primaryFixed,
        fg: colors.onPrimaryFixedVariant,
        label: 'Tasdiqlangan',
      },
      packing: {
        bg: colors.primaryFixed,
        fg: colors.onPrimaryFixedVariant,
        label: 'Tayyorlanmoqda',
      },
      handed_to_taxi: {
        bg: colors.secondaryFixed,
        fg: colors.onSecondaryFixed,
        label: 'Kuryerda',
        icon: 'moped',
      },
      delivered: {
        bg: colors.tertiaryFixed,
        fg: colors.onTertiaryFixedVariant,
        label: 'Yetkazildi',
      },
      cancelled: {
        bg: colors.errorContainer,
        fg: colors.onErrorContainer,
        label: 'Bekor qilindi',
      },
    };
    const m = map[order.status];
    return (
      <View style={[styles.statusChip, { backgroundColor: m.bg }]}>
        {m.icon ? <Icon name={m.icon} size={13} color={m.fg} /> : null}
        <Text
          style={[theme.typography.labelSm, { color: m.fg, fontSize: 11, fontFamily: 'Inter_600SemiBold' }]}
        >
          {m.label}
        </Text>
      </View>
    );
  };

  const edgeColor: Record<OrderStatus, string> = {
    pending: colors.error,
    confirmed: colors.primaryFixedDim,
    packing: colors.primaryContainer,
    handed_to_taxi: colors.secondaryContainer,
    delivered: colors.tertiaryContainer,
    cancelled: colors.error,
  };

  const renderOrderActions = (order: Order) => {
    const busy = statusMut.isPending && statusMut.variables?.id === order._id;
    const cust = typeof order.user === 'object' ? (order.user as User) : null;
    if (order.status === 'pending') {
      return (
        <View style={styles.actionsRow}>
          <Pressable
            disabled={busy}
            onPress={() => changeStatus(order, 'confirmed')}
            style={({ pressed }) => [
              styles.actionPrimary,
              { backgroundColor: colors.tertiary, opacity: pressed || busy ? 0.85 : 1 },
            ]}
          >
            {busy ? (
              <ActivityIndicator size="small" color={colors.onTertiary} />
            ) : (
              <Icon name="check_circle" size={18} color={colors.onTertiary} />
            )}
            <Text style={[theme.typography.labelMd, { color: colors.onTertiary }]}>Qabul qilish</Text>
          </Pressable>
          <Pressable
            disabled={busy}
            onPress={() =>
              changeStatus(order, 'cancelled', 'Buyurtma bekor qilinadi. Davom etasizmi?')
            }
            style={({ pressed }) => [
              styles.actionGhost,
              { backgroundColor: colors.surfaceContainer, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Icon name="close" size={18} color={colors.error} />
            <Text style={[theme.typography.labelMd, { color: colors.error }]}>Bekor qilish</Text>
          </Pressable>
        </View>
      );
    }
    if (order.status === 'confirmed') {
      return (
        <View style={styles.actionsRow}>
          <Pressable
            disabled={busy}
            onPress={() => changeStatus(order, 'packing')}
            style={({ pressed }) => [
              styles.actionPrimary,
              { backgroundColor: colors.primary, opacity: pressed || busy ? 0.85 : 1 },
            ]}
          >
            {busy ? (
              <ActivityIndicator size="small" color={colors.onPrimary} />
            ) : (
              <Icon name="restaurant" size={18} color={colors.onPrimary} />
            )}
            <Text style={[theme.typography.labelMd, { color: colors.onPrimary }]}>
              Tayyorlashni boshlash
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setDetail(order)}
            style={({ pressed }) => [
              styles.actionGhost,
              { backgroundColor: colors.surfaceContainerHigh, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Icon name="receipt" size={18} color={colors.onSurface} />
            <Text style={[theme.typography.labelMd, { color: colors.onSurface }]}>Tafsilot</Text>
          </Pressable>
        </View>
      );
    }
    if (order.status === 'packing') {
      return (
        <View style={styles.actionsRow}>
          <Pressable
            disabled={busy}
            onPress={() => changeStatus(order, 'handed_to_taxi')}
            style={({ pressed }) => [
              styles.actionPrimary,
              { backgroundColor: colors.primary, opacity: pressed || busy ? 0.85 : 1 },
            ]}
          >
            {busy ? (
              <ActivityIndicator size="small" color={colors.onPrimary} />
            ) : (
              <Icon name="done_all" size={18} color={colors.onPrimary} />
            )}
            <Text style={[theme.typography.labelMd, { color: colors.onPrimary }]}>
              Tayyor bo'ldi
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setDetail(order)}
            style={({ pressed }) => [
              styles.actionGhost,
              { backgroundColor: colors.surfaceContainerHigh, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Icon name="receipt" size={18} color={colors.onSurface} />
            <Text style={[theme.typography.labelMd, { color: colors.onSurface }]}>Tafsilot</Text>
          </Pressable>
        </View>
      );
    }
    if (order.status === 'handed_to_taxi') {
      return (
        <View style={styles.actionsRow}>
          <Pressable
            disabled={busy}
            onPress={() => changeStatus(order, 'delivered')}
            style={({ pressed }) => [
              styles.actionPrimary,
              { backgroundColor: colors.tertiary, opacity: pressed || busy ? 0.85 : 1 },
            ]}
          >
            {busy ? (
              <ActivityIndicator size="small" color={colors.onTertiary} />
            ) : (
              <Icon name="check_circle" size={18} color={colors.onTertiary} />
            )}
            <Text style={[theme.typography.labelMd, { color: colors.onTertiary }]}>
              Yetkazildi
            </Text>
          </Pressable>
          {cust?.phone ? (
            <Pressable
              onPress={() => void Linking.openURL(`tel:${cust.phone}`).catch(() => undefined)}
              style={({ pressed }) => [
                styles.actionGhost,
                { backgroundColor: colors.surfaceContainer, opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <Icon name="call" size={18} color={colors.onSurface} />
              <Text style={[theme.typography.labelMd, { color: colors.onSurface }]}>Bog'lanish</Text>
            </Pressable>
          ) : null}
        </View>
      );
    }
    return (
      <View style={styles.actionsRow}>
        <Pressable
          onPress={() => setDetail(order)}
          style={({ pressed }) => [
            styles.actionGhost,
            { backgroundColor: colors.surfaceContainerHigh, opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <Icon name="receipt" size={18} color={colors.onSurface} />
          <Text style={[theme.typography.labelMd, { color: colors.onSurface }]}>Tafsilot</Text>
        </Pressable>
      </View>
    );
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />

      {/* Sarlavha */}
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
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={[theme.typography.headlineMd, { color: colors.onSurface }]}>
            Boyxon Boshqaruv
          </Text>
          <Text style={[theme.typography.labelSm, { color: colors.onSurfaceVariant }]}>
            Admin panel
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: 32 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshAll}
            tintColor={colors.primaryContainer}
            colors={[colors.primaryContainer]}
          />
        }
      >
        {/* 1. Holat kartasi */}
        <View style={card}>
          <View style={styles.statusTop}>
            <View style={styles.statusLeft}>
              <View style={styles.liveDotWrap}>
                <View style={[styles.liveDotOuter, { backgroundColor: colors.tertiary }]} />
                <View style={[styles.liveDot, { backgroundColor: colors.tertiary }]} />
              </View>
              <View style={{ flex: 1, minWidth: 0 }}>
                <View style={styles.statusTitleRow}>
                  <Text
                    numberOfLines={1}
                    style={[theme.typography.labelLg, { color: colors.onSurface }]}
                  >
                    Toshkent filiali
                  </Text>
                  <View style={[styles.liveBadge, { backgroundColor: colors.tertiaryFixed }]}>
                    <Text
                      style={[
                        theme.typography.labelSm,
                        {
                          color: colors.onTertiaryFixedVariant,
                          fontSize: 10,
                          letterSpacing: 0.6,
                          fontFamily: 'Inter_600SemiBold',
                        },
                      ]}
                    >
                      JONLI TIZIM
                    </Text>
                  </View>
                </View>
                <Text
                  numberOfLines={1}
                  style={[theme.typography.bodySm, { color: colors.onSurfaceVariant }]}
                >
                  Ish vaqti: 10:00 — 23:00
                </Text>
              </View>
            </View>
            <View style={styles.statusActions}>
              <Pressable
                accessibilityLabel="Yangilash"
                onPress={refreshAll}
                style={({ pressed }) => [
                  styles.syncBtn,
                  { backgroundColor: colors.surfaceContainer, opacity: pressed ? 0.85 : 1 },
                ]}
              >
                <Icon name="sync" size={20} color={colors.onSurface} />
              </Pressable>
              <Pressable
                onPress={() => showToast("Yangi taom qo'shish veb-panelda mavjud", 'info')}
                style={({ pressed }) => [
                  styles.newDishBtn,
                  { backgroundColor: colors.primary, opacity: pressed ? 0.9 : 1 },
                ]}
              >
                <Icon name="add" size={18} color={colors.onPrimary} />
                <Text style={[theme.typography.labelMd, { color: colors.onPrimary }]}>
                  Yangi taom
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Qidiruv */}
          <View style={[styles.searchBox, { backgroundColor: colors.surfaceContainerLow }]}>
            <Icon name="search" size={20} color={colors.outline} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Buyurtma yoki mijoz izlash..."
              placeholderTextColor={colors.outline}
              style={[theme.typography.bodyMd, styles.searchInput, { color: colors.onSurface }]}
            />
            <Icon name="tune" size={18} color={colors.outline} />
          </View>
        </View>

        {/* 2. KPI lar */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={[theme.typography.headlineSm, { color: colors.onSurface }]}>
              Bugungi ko'rsatkichlar
            </Text>
            <Text
              style={[
                theme.typography.labelSm,
                { color: colors.secondaryContainer, fontFamily: 'Inter_600SemiBold' },
              ]}
            >
              {statsQ.isFetching ? 'yangilanmoqda...' : 'yangilandi'}
            </Text>
          </View>

          {statsQ.isLoading ? (
            <View style={styles.loading}>
              <ActivityIndicator size="large" color={colors.primaryContainer} />
            </View>
          ) : (
            <View style={styles.kpiGrid}>
              <View style={[card, styles.kpiCard]}>
                <View style={styles.kpiTop}>
                  <View style={[styles.kpiIcon, { backgroundColor: colors.primaryFixed }]}>
                    <Icon name="account_balance_wallet" size={20} color={colors.onPrimaryFixed} />
                  </View>
                  {chip(colors.tertiaryFixed, colors.onTertiaryFixedVariant, `${stats?.ordersCount ?? 0} ta chek`, 'trending_up')}
                </View>
                <Text style={[theme.typography.headlineSm, { color: colors.onSurface, letterSpacing: -0.3 }]}>
                  {formatPrice(stats?.revenue ?? 0)}
                </Text>
                <View style={styles.kpiFoot}>
                  <Text style={[theme.typography.labelSm, { color: colors.onSurfaceVariant }]}>
                    Umumiy tushum
                  </Text>
                  <Text style={[theme.typography.labelSm, { color: colors.outline, fontSize: 10 }]}>
                    barcha vaqt
                  </Text>
                </View>
              </View>

              <View style={[card, styles.kpiCard]}>
                <View style={styles.kpiTop}>
                  <View style={[styles.kpiIcon, { backgroundColor: colors.secondaryFixed }]}>
                    <Icon name="receipt_long" size={20} color={colors.onSecondaryFixed} />
                  </View>
                  {chip(
                    colors.secondaryFixed,
                    colors.secondary,
                    `Faol: ${stats?.pendingOrders ?? 0}`,
                  )}
                </View>
                <Text style={[theme.typography.headlineSm, { color: colors.onSurface, letterSpacing: -0.3 }]}>
                  {stats?.ordersCount ?? 0} ta buyurtma
                </Text>
                <Text style={[theme.typography.labelSm, { color: colors.onSurfaceVariant }]}>
                  {stats?.pendingOrders ?? 0} ta faol jarayonda
                </Text>
              </View>

              <View style={[card, styles.kpiCard]}>
                <View style={styles.kpiTop}>
                  <View style={[styles.kpiIcon, { backgroundColor: colors.surfaceContainerHigh }]}>
                    <Icon name="restaurant_menu" size={20} color={colors.primary} />
                  </View>
                  {chip(colors.tertiaryFixed, colors.onTertiaryFixedVariant, 'Menyu')}
                </View>
                <Text style={[theme.typography.headlineSm, { color: colors.onSurface, letterSpacing: -0.3 }]}>
                  {stats?.dishes ?? 0} ta taom
                </Text>
                <Text style={[theme.typography.labelSm, { color: colors.onSurfaceVariant }]}>
                  Faol taomlar
                </Text>
              </View>

              <View style={[card, styles.kpiCard]}>
                <View style={styles.kpiTop}>
                  <View style={[styles.kpiIcon, { backgroundColor: colors.secondaryFixed }]}>
                    <Icon name="group" size={20} color={colors.onSecondaryFixed} />
                  </View>
                  {chip(colors.tertiaryFixed, colors.onTertiaryFixedVariant, 'Mijozlar')}
                </View>
                <Text style={[theme.typography.headlineSm, { color: colors.onSurface, letterSpacing: -0.3 }]}>
                  {stats?.users ?? 0} ta foydalanuvchi
                </Text>
                <Text style={[theme.typography.labelSm, { color: colors.onSurfaceVariant }]}>
                  Ro'yxatdan o'tgan
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* 3. Jonli buyurtmalar */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <View style={styles.sectionTitleRow}>
              <Text style={[theme.typography.headlineSm, { color: colors.onSurface }]}>
                Jonli Buyurtmalar
              </Text>
              <View style={[styles.pulse, { backgroundColor: colors.primaryContainer }]} />
            </View>
            <Text
              style={[
                theme.typography.labelSm,
                { color: colors.primary, fontFamily: 'Inter_600SemiBold' },
              ]}
            >
              Barchasi
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsRow}
          >
            {FILTERS.map((f) => {
              const active = f.key === filter;
              const isNew = f.key === 'pending';
              const bg = active
                ? colors.primary
                : isNew
                  ? colors.errorContainer
                  : colors.surfaceContainerLowest;
              const fg = active
                ? colors.onPrimary
                : isNew
                  ? colors.onErrorContainer
                  : colors.onSurface;
              return (
                <Pressable
                  key={f.key}
                  onPress={() => setFilter(f.key)}
                  style={({ pressed }) => [
                    styles.filterChip,
                    { backgroundColor: bg, opacity: pressed ? 0.85 : 1 },
                  ]}
                >
                  {isNew && !active ? (
                    <View style={[styles.chipDot, { backgroundColor: colors.error }]} />
                  ) : null}
                  <Text style={[theme.typography.labelSm, { color: fg }]}>{f.label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {ordersQ.isLoading ? (
            <View style={styles.loading}>
              <ActivityIndicator size="large" color={colors.primaryContainer} />
            </View>
          ) : orders.length === 0 ? (
            <View style={card}>
              <Text
                style={[
                  theme.typography.bodySm,
                  { color: colors.onSurfaceVariant, textAlign: 'center', paddingVertical: 12 },
                ]}
              >
                Buyurtmalar topilmadi
              </Text>
            </View>
          ) : (
            <View style={styles.ordersList}>
              {orders.map((order) => {
                const cust = typeof order.user === 'object' ? (order.user as User) : null;
                const itemsCount = order.items.reduce((s, i) => s + i.quantity, 0);
                const itemsText = order.items.map((i) => `${i.name} ${i.quantity}x`).join(', ');
                return (
                  <View key={order._id} style={[card, styles.orderCard]}>
                    <View style={[styles.edge, { backgroundColor: edgeColor[order.status] }]} />
                    <View style={styles.orderHead}>
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <View style={styles.orderNumRow}>
                          <Text
                            style={[
                              theme.typography.labelLg,
                              { color: colors.onSurface, fontFamily: 'Epilogue_700Bold' },
                            ]}
                          >
                            #{order.orderNumber}
                          </Text>
                          <Text
                            style={[
                              theme.typography.bodySm,
                              {
                                color:
                                  order.status === 'pending' && isFresh(order.createdAt)
                                    ? colors.error
                                    : colors.onSurfaceVariant,
                                fontSize: 11,
                              },
                            ]}
                          >
                            {order.status === 'pending' && isFresh(order.createdAt) ? '⚡ ' : ''}
                            {timeAgo(order.createdAt)}
                          </Text>
                        </View>
                        <View style={styles.customerRow}>
                          <Text
                            numberOfLines={1}
                            style={[theme.typography.labelMd, { color: colors.onSurface }]}
                          >
                            {cust?.name ?? 'Mijoz'}
                          </Text>
                          {cust?.phone ? (
                            <Text
                              numberOfLines={1}
                              style={[theme.typography.bodySm, { color: colors.outline, fontSize: 11 }]}
                            >
                              ({cust.phone})
                            </Text>
                          ) : null}
                        </View>
                      </View>
                      {statusChip(order)}
                    </View>

                    <View style={[styles.itemsBox, { backgroundColor: colors.surfaceContainerLow }]}>
                      <Text
                        numberOfLines={2}
                        style={[theme.typography.bodySm, { color: colors.onSurface }]}
                      >
                        {itemsText}{' '}
                        <Text style={{ color: colors.outline, fontFamily: 'Inter_500Medium' }}>
                          (Jami {itemsCount} taom)
                        </Text>
                      </Text>
                      <View style={styles.itemsFoot}>
                        <Text
                          style={[
                            theme.typography.labelMd,
                            { color: colors.onSurface, fontFamily: 'Inter_600SemiBold' },
                          ]}
                        >
                          {formatPrice(order.total)}
                        </Text>
                        <View style={styles.itemsMeta}>
                          <Text
                            style={[
                              theme.typography.labelSm,
                              { color: colors.onSurfaceVariant, fontSize: 11 },
                            ]}
                          >
                            {PAY_LABELS[order.paymentMethod] ?? order.paymentMethod}
                          </Text>
                          <Text
                            numberOfLines={1}
                            style={[
                              theme.typography.labelSm,
                              { color: colors.onSurfaceVariant, fontSize: 11, maxWidth: 140 },
                            ]}
                          >
                            {order.deliveryType === 'pickup'
                              ? 'Olib ketish'
                              : (order.address?.address ?? 'Manzil yo‘q')}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {order.status === 'handed_to_taxi' && order.taxi?.driver ? (
                      <View style={styles.courierRow}>
                        <View
                          style={[
                            styles.courierAvatar,
                            { backgroundColor: colors.secondaryFixed },
                          ]}
                        >
                          <Text
                            style={[
                              theme.typography.labelSm,
                              { color: colors.onSecondaryFixed, fontFamily: 'Epilogue_700Bold' },
                            ]}
                          >
                            {getInitials(order.taxi.driver)}
                          </Text>
                        </View>
                        <View style={{ flex: 1, minWidth: 0 }}>
                          <Text
                            numberOfLines={1}
                            style={[theme.typography.labelMd, { color: colors.onSurface }]}
                          >
                            {order.taxi.driver}
                          </Text>
                          <Text
                            numberOfLines={1}
                            style={[theme.typography.bodySm, { color: colors.tertiary, fontSize: 11 }]}
                          >
                            {order.taxi.carNumber
                              ? `${order.taxi.carNumber} · yo'lda`
                              : order.taxi.service
                                ? `${order.taxi.service} · yo'lda`
                                : "Yo'lda"}
                          </Text>
                        </View>
                      </View>
                    ) : null}

                    {renderOrderActions(order)}
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* 4. Stop-list */}
        <View style={[card, styles.section]}>
          <View style={styles.sectionHead}>
            <View style={styles.sectionTitleRow}>
              <View style={[styles.kpiIcon, { backgroundColor: colors.primaryFixed }]}>
                <Icon name="inventory_2" size={20} color={colors.onPrimaryFixed} />
              </View>
              <View style={{ minWidth: 0, flex: 1 }}>
                <Text style={[theme.typography.headlineSm, { color: colors.onSurface }]}>
                  Oshxona Stop-listi & Zaxira
                </Text>
                <Text
                  numberOfLines={1}
                  style={[theme.typography.bodySm, { color: colors.onSurfaceVariant }]}
                >
                  Zaxira tugasa taom avtomatik yopiladi
                </Text>
              </View>
            </View>
            <Text
              style={[
                theme.typography.labelSm,
                { color: colors.primary, fontFamily: 'Inter_600SemiBold' },
              ]}
            >
              Hammasi
            </Text>
          </View>

          {dishesQ.isLoading ? (
            <View style={styles.loading}>
              <ActivityIndicator size="large" color={colors.primaryContainer} />
            </View>
          ) : (
            <View style={styles.dishList}>
              {dishes.map((dish: Dish) => {
                const stopped = !dish.isActive;
                const catName = typeof dish.category === 'object' ? dish.category.name : '';
                const busy = toggleMut.isPending && toggleMut.variables === dish._id;
                return (
                  <View
                    key={dish._id}
                    style={[
                      styles.dishRow,
                      {
                        backgroundColor: stopped
                          ? colors.errorContainer
                          : colors.surfaceContainerLow,
                      },
                    ]}
                  >
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <View style={styles.dishTitleRow}>
                        <Text
                          numberOfLines={1}
                          style={[
                            theme.typography.labelLg,
                            {
                              color: colors.onSurface,
                              flexShrink: 1,
                              textDecorationLine: stopped ? 'line-through' : 'none',
                              opacity: stopped ? 0.8 : 1,
                            },
                          ]}
                        >
                          {dish.name}
                        </Text>
                        <View
                          style={[
                            styles.dishBadge,
                            {
                              backgroundColor: stopped ? colors.error : colors.tertiaryFixed,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              theme.typography.labelSm,
                              {
                                color: stopped ? colors.onError : colors.onTertiaryFixedVariant,
                                fontSize: 10,
                                fontFamily: 'Inter_600SemiBold',
                              },
                            ]}
                          >
                            {stopped ? 'Tugadi' : 'Mavjud'}
                          </Text>
                        </View>
                      </View>
                      <Text
                        numberOfLines={1}
                        style={[
                          theme.typography.bodySm,
                          {
                            color: stopped ? colors.error : colors.onSurfaceVariant,
                            fontSize: 11,
                            marginTop: 2,
                          },
                        ]}
                      >
                        {formatPrice(dish.price)}
                        {catName ? ` · ${catName}` : ''}
                        {stopped ? ' · Stop-listda faol' : ''}
                      </Text>
                    </View>
                    {busy ? (
                      <ActivityIndicator size="small" color={colors.error} />
                    ) : (
                      <Toggle
                        value={stopped}
                        activeColor={colors.error}
                        onChange={() => toggleMut.mutate(dish._id)}
                      />
                    )}
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* 5. Kuryerlar */}
        <View style={[card, styles.section]}>
          <View style={styles.sectionHead}>
            <View style={styles.sectionTitleRow}>
              <Icon name="two_wheeler" size={22} color={colors.primary} />
              <Text style={[theme.typography.headlineSm, { color: colors.onSurface }]}>
                Kuryerlar Holati
              </Text>
            </View>
            <View style={[styles.badgePill, { backgroundColor: colors.secondaryFixed }]}>
              <Text
                style={[
                  theme.typography.labelSm,
                  { color: colors.onSecondaryFixed, fontFamily: 'Inter_600SemiBold' },
                ]}
              >
                Band: {couriers.length}
              </Text>
            </View>
          </View>

          {couriers.length === 0 ? (
            <Text
              style={[
                theme.typography.bodySm,
                { color: colors.onSurfaceVariant, paddingVertical: 6 },
              ]}
            >
              Hozircha faol kuryer yo'q
            </Text>
          ) : (
            <View style={styles.courierList}>
              {couriers.map((o) => {
                const driver = o.taxi?.driver || 'Kuryer biriktirilmagan';
                return (
                  <View
                    key={o._id}
                    style={[styles.courierListItem, { backgroundColor: colors.surfaceContainerLow }]}
                  >
                    <View
                      style={[styles.courierAvatar, { backgroundColor: colors.secondaryContainer }]}
                    >
                      <Text
                        style={[
                          theme.typography.labelSm,
                          { color: colors.onSecondaryContainer, fontFamily: 'Epilogue_700Bold' },
                        ]}
                      >
                        {getInitials(driver) || 'K'}
                      </Text>
                    </View>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text
                        numberOfLines={1}
                        style={[theme.typography.labelLg, { color: colors.onSurface }]}
                      >
                        {driver}
                      </Text>
                      <Text
                        numberOfLines={1}
                        style={[
                          theme.typography.bodySm,
                          { color: colors.onSurfaceVariant, fontSize: 11 },
                        ]}
                      >
                        #{o.orderNumber} ·{' '}
                        {o.taxi?.carNumber || o.taxi?.service || "Yo'lda"}
                      </Text>
                    </View>
                    <Text
                      style={[
                        theme.typography.labelSm,
                        {
                          color: colors.secondary,
                          fontFamily: 'Inter_600SemiBold',
                        },
                      ]}
                    >
                      Band
                    </Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        {/* 6. Tezkor push */}
        <LinearGradient
          colors={[colors.primaryFixed, colors.secondaryFixed]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.pushCard, theme.shadows.raised]}
        >
          <View style={styles.sectionHead}>
            <View style={styles.sectionTitleRow}>
              <Icon name="campaign" size={20} color={colors.onPrimaryFixed} />
              <Text style={[theme.typography.headlineSm, { color: colors.onPrimaryFixed }]}>
                Tezkor Aksiya / Push
              </Text>
            </View>
            <View style={[styles.badgePill, { backgroundColor: colors.surfaceContainerLowest }]}>
              <Text
                style={[
                  theme.typography.labelSm,
                  { color: colors.onSurface, fontFamily: 'Inter_600SemiBold' },
                ]}
              >
                {stats?.users ?? 0} ta mijozga
              </Text>
            </View>
          </View>
          <Pressable
            onPress={() => setPushOpen(true)}
            style={({ pressed }) => [
              styles.pushDraft,
              { backgroundColor: colors.surfaceContainerLowest, opacity: pressed ? 0.9 : 1 },
            ]}
          >
            <Text style={[theme.typography.labelMd, { color: colors.onSurface }]}>
              🔥 {pushTitle || 'Xabar matnini kiriting (masalan: Issiq tandir somsa chiqdi! 15% chegirma)'}
            </Text>
            <Text
              style={[
                theme.typography.bodySm,
                { color: colors.onSurfaceVariant, fontSize: 11, marginTop: 2 },
              ]}
            >
              Barcha faol mobil ilova foydalanuvchilariga darhol yuboriladi
            </Text>
          </Pressable>
          <Button
            title="Yuborish (Tasdiqlash)"
            icon="send"
            onPress={() => setPushOpen(true)}
            style={{ marginTop: 10 }}
          />
        </LinearGradient>
      </ScrollView>

      {/* Push modal */}
      <Modal visible={pushOpen} transparent animationType="slide" onRequestClose={() => setPushOpen(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalRoot}
        >
          <Pressable style={styles.backdrop} onPress={() => setPushOpen(false)} />
          <View
            style={[
              styles.sheet,
              theme.shadows.modal,
              { backgroundColor: colors.surfaceContainerLowest, paddingBottom: 20 + insets.bottom },
            ]}
          >
            <Text style={[theme.typography.headlineSm, { color: colors.onSurface }]}>
              Tezkor push xabar
            </Text>
            <Text
              style={[
                theme.typography.bodySm,
                { color: colors.onSurfaceVariant, marginTop: 4 },
              ]}
            >
              Xabar push-bildirishnoma va ilova ichida yuboriladi
            </Text>

            <Text
              style={[
                theme.typography.labelMd,
                { color: colors.onSurface, marginTop: 14, marginBottom: 6 },
              ]}
            >
              Sarlavha
            </Text>
            <TextInput
              value={pushTitle}
              onChangeText={setPushTitle}
              placeholder="Boyxon Oshxonasi"
              placeholderTextColor={colors.outline}
              style={[
                theme.typography.bodyMd,
                styles.modalInput,
                { backgroundColor: colors.surfaceContainerLow, color: colors.onSurface },
              ]}
            />

            <Text
              style={[
                theme.typography.labelMd,
                { color: colors.onSurface, marginTop: 12, marginBottom: 6 },
              ]}
            >
              Xabar
            </Text>
            <TextInput
              value={pushMessage}
              onChangeText={setPushMessage}
              placeholder="🔥 Issiq tandir somsa chiqdi! 15% chegirma"
              placeholderTextColor={colors.outline}
              multiline
              style={[
                theme.typography.bodyMd,
                styles.modalInput,
                styles.modalInputMulti,
                { backgroundColor: colors.surfaceContainerLow, color: colors.onSurface },
              ]}
            />

            <Text
              style={[
                theme.typography.labelMd,
                { color: colors.onSurface, marginTop: 12, marginBottom: 6 },
              ]}
            >
              Auditoriya
            </Text>
            <SegmentedControl
              items={[
                { key: 'all', label: 'Barchasi' },
                { key: 'active', label: 'Faol' },
                { key: 'new', label: 'Yangi' },
              ]}
              value={audience}
              onChange={(k) => setAudience(k as 'all' | 'active' | 'new')}
            />

            <Button
              title="Yuborish (Tasdiqlash)"
              icon="send"
              loading={pushMut.isPending}
              disabled={!pushTitle.trim() || !pushMessage.trim() || pushMut.isPending}
              onPress={() => pushMut.mutate()}
              style={{ marginTop: 16 }}
            />
            <Pressable onPress={() => setPushOpen(false)} style={styles.cancelLink}>
              <Text style={[theme.typography.labelMd, { color: colors.onSurfaceVariant }]}>
                Bekor qilish
              </Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Buyurtma tafsiloti modal */}
      <Modal visible={!!detail} transparent animationType="slide" onRequestClose={() => setDetail(null)}>
        <View style={styles.modalRoot}>
          <Pressable style={styles.backdrop} onPress={() => setDetail(null)} />
          <View
            style={[
              styles.sheet,
              theme.shadows.modal,
              { backgroundColor: colors.surfaceContainerLowest, paddingBottom: 20 + insets.bottom },
            ]}
          >
            {detail ? (
              <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 520 }}>
                <View style={styles.detailHead}>
                  <Text
                    style={[
                      theme.typography.headlineSm,
                      { color: colors.onSurface, fontFamily: 'Epilogue_700Bold' },
                    ]}
                  >
                    #{detail.orderNumber}
                  </Text>
                  {statusChip(detail)}
                </View>
                <Text
                  style={[
                    theme.typography.bodySm,
                    { color: colors.onSurfaceVariant, marginTop: 2 },
                  ]}
                >
                  {timeAgo(detail.createdAt)} ·{' '}
                  {PAY_LABELS[detail.paymentMethod] ?? detail.paymentMethod}
                </Text>

                <View style={[styles.detailBox, { backgroundColor: colors.surfaceContainerLow }]}>
                  {detail.items.map((it, idx) => (
                    <View key={`${it.dish}-${idx}`} style={styles.detailItemRow}>
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
                          theme.typography.labelMd,
                          { color: colors.onSurface, marginLeft: 10, minWidth: 84, textAlign: 'right' },
                        ]}
                      >
                        {formatPrice(it.price * it.quantity)}
                      </Text>
                    </View>
                  ))}
                </View>

                <View style={styles.detailRows}>
                  {typeof detail.user === 'object' ? (
                    <Text style={[theme.typography.bodySm, { color: colors.onSurfaceVariant }]}>
                      Mijoz: {(detail.user as User).name}
                      {(detail.user as User).phone ? ` · ${(detail.user as User).phone}` : ''}
                    </Text>
                  ) : null}
                  <Text style={[theme.typography.bodySm, { color: colors.onSurfaceVariant }]}>
                    {detail.deliveryType === 'pickup'
                      ? 'Olib ketish'
                      : `Manzil: ${detail.address?.address ?? '—'}`}
                  </Text>
                  {detail.taxi?.driver ? (
                    <Text style={[theme.typography.bodySm, { color: colors.onSurfaceVariant }]}>
                      Kuryer: {detail.taxi.driver}
                      {detail.taxi.carNumber ? ` · ${detail.taxi.carNumber}` : ''}
                    </Text>
                  ) : null}
                  {detail.notes ? (
                    <Text style={[theme.typography.bodySm, { color: colors.onSurfaceVariant }]}>
                      Izoh: {detail.notes}
                    </Text>
                  ) : null}
                  <Text
                    style={[
                      theme.typography.labelLg,
                      { color: colors.primary, marginTop: 6 },
                    ]}
                  >
                    Jami: {formatPrice(detail.total)}
                  </Text>
                </View>
              </ScrollView>
            ) : null}
            <Button
              title="Yopish"
              variant="ghost"
              onPress={() => setDetail(null)}
              style={{ marginTop: 12 }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* ---------- uslublar ---------- */

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
  scroll: { paddingHorizontal: 16, paddingTop: 8, gap: 16 },
  card: { borderRadius: 12, padding: 14 },
  section: { gap: 10 },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 },
  loading: { paddingVertical: 32, alignItems: 'center' },

  statusTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 },
  liveDotWrap: { width: 10, height: 10, alignItems: 'center', justifyContent: 'center' },
  liveDotOuter: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    opacity: 0.3,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3 },
  statusTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  liveBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 999 },
  statusActions: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  syncBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newDishBtn: {
    height: 36,
    paddingHorizontal: 12,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  searchBox: {
    marginTop: 12,
    height: 44,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: { flex: 1, paddingVertical: 0 },

  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  kpiCard: { width: '48.5%', gap: 4 },
  kpiTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  kpiIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
  },
  kpiFoot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },

  chipsRow: { gap: 6, paddingBottom: 2 },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
  },
  chipDot: { width: 6, height: 6, borderRadius: 3 },

  ordersList: { gap: 12 },
  orderCard: { paddingLeft: 18, gap: 10, overflow: 'hidden' },
  edge: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4 },
  orderHead: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  orderNumRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  customerRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  itemsBox: { borderRadius: 10, padding: 10, gap: 8 },
  itemsFoot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  itemsMeta: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  courierRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  courierAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionsRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  actionPrimary: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  actionGhost: {
    height: 40,
    paddingHorizontal: 14,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },

  dishList: { gap: 8 },
  dishRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 10,
    padding: 10,
  },
  dishTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dishBadge: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4 },

  badgePill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  courierList: { gap: 8 },
  courierListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 10,
    padding: 8,
  },

  pushCard: { borderRadius: 12, padding: 14 },
  pushDraft: { borderRadius: 10, padding: 10, marginTop: 10 },

  modalRoot: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  modalInput: {
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  modalInputMulti: { minHeight: 84, textAlignVertical: 'top' },
  cancelLink: { alignItems: 'center', paddingVertical: 12 },
  detailHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  detailBox: { borderRadius: 10, padding: 10, marginTop: 12, gap: 8 },
  detailItemRow: { flexDirection: 'row', alignItems: 'center' },
  detailRows: { marginTop: 12, gap: 4 },

  toggleTrack: {
    width: 44,
    height: 24,
    borderRadius: 12,
    padding: 2,
    justifyContent: 'center',
  },
  toggleThumb: { width: 20, height: 20, borderRadius: 10 },
});
