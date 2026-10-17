import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { categoriesApi, dishesApi } from '../../api/dishes.api';
import type { Dish } from '../../api/types';
import { usersApi } from '../../api/users.api';
import { AppBar } from '../../components/AppBar';
import { Chip } from '../../components/Chip';
import { EmptyState } from '../../components/EmptyState';
import { Icon } from '../../components/Icon';
import { Placeholder } from '../../components/Placeholder';
import { SectionHeader } from '../../components/SectionHeader';
import { dishIconFor } from '../../lib/dishIcons';
import { formatPrice, localizedDishDescription, localizedDishName } from '../../lib/format';
import { useDebouncedValue } from '../../lib/hooks';
import { getInitials } from '../../lib/initials';
import { useAuthStore } from '../../store/auth.store';
import { useCartStore } from '../../store/cart.store';
import { useToastStore } from '../../store/toast.store';
import { useTheme } from '../../theme/ThemeProvider';

const PUSH_PROMPT_KEY = 'boyxon.push-prompt-dismissed';

const SORT_OPTIONS: { key: string; label: string }[] = [
  { key: 'popular', label: 'Ommabop' },
  { key: 'rating', label: 'Reyting bo‘yicha' },
  { key: 'price_asc', label: 'Arzon → Qimmat' },
  { key: 'price_desc', label: 'Qimmat → Arzon' },
];

function DishRow({
  dish,
  onAdd,
  onPress,
}: {
  dish: Dish;
  onAdd: () => void;
  onPress: () => void;
}) {
  const theme = useTheme();
  const { colors } = theme;
  const { i18n } = useTranslation();
  const name = localizedDishName(dish, i18n.language);
  const desc = localizedDishDescription(dish, i18n.language);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        theme.shadows.card,
        { backgroundColor: colors.surfaceContainerLowest, opacity: pressed ? 0.95 : 1 },
      ]}
    >
      {dish.image ? (
        <Image source={{ uri: dish.image }} style={styles.thumb} contentFit="cover" transition={200} />
      ) : (
        <Placeholder size={96} icon={dishIconFor(dish)} />
      )}
      <View style={styles.cardBody}>
        <View>
          <Text
            numberOfLines={1}
            style={[theme.typography.labelLg, { color: colors.onSurface, fontFamily: 'Inter_600SemiBold' }]}
          >
            {name}
          </Text>
          <Text
            numberOfLines={2}
            style={[theme.typography.bodySm, { color: colors.onSurfaceVariant, marginTop: 2 }]}
          >
            {desc}
          </Text>
        </View>
        <View style={styles.cardBottom}>
          <View>
            {dish.rating > 0 ? (
              <View style={styles.ratingRow}>
                <Icon name="star" size={14} color={colors.primary} />
                <Text
                  style={[
                    theme.typography.labelSm,
                    { color: colors.onSurface, fontFamily: 'Inter_600SemiBold' },
                  ]}
                >
                  {dish.rating.toFixed(1)}
                </Text>
                {dish.reviewCount > 0 ? (
                  <Text style={[theme.typography.bodySm, { color: colors.onSurfaceVariant, opacity: 0.7 }]}>
                    ({dish.reviewCount})
                  </Text>
                ) : null}
              </View>
            ) : null}
            <Text
              style={[theme.typography.labelLg, { color: colors.primary, fontFamily: 'Inter_600SemiBold' }]}
            >
              {formatPrice(dish.price)}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={onAdd}
            style={({ pressed }) => [
              styles.addBtn,
              {
                backgroundColor: colors.primary,
                opacity: pressed ? 0.85 : 1,
                transform: [{ scale: pressed ? 0.96 : 1 }],
              },
            ]}
          >
            <Icon name="add" size={16} color={colors.onPrimary} />
            <Text style={[theme.typography.labelSm, { color: colors.onPrimary }]}>Savatga</Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

/** Dizayn 02: Asosiy menyu. */
export default function HomeScreen() {
  const theme = useTheme();
  const { colors } = theme;
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const showToast = useToastStore((s) => s.show);
  const user = useAuthStore((s) => s.user);

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 400);
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [pushDismissed, setPushDismissed] = useState(true);
  const searchRef = useRef<React.ComponentRef<typeof TextInput>>(null);

  useEffect(() => {
    AsyncStorage.getItem(PUSH_PROMPT_KEY)
      .then((v) => setPushDismissed(v === '1'))
      .catch(() => setPushDismissed(false));
  }, []);

  const categoriesQ = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.list(),
  });

  const listQ = useQuery({
    queryKey: ['dishes', { category, search: debouncedSearch, sort }],
    queryFn: () =>
      dishesApi.list({
        category: category === 'all' ? undefined : category,
        search: debouncedSearch.trim() || undefined,
        sort: sort || undefined,
        limit: 30,
      }),
  });

  const dishes = listQ.data?.data ?? [];
  const total = listQ.data?.pagination.total ?? 0;
  const categories = categoriesQ.data?.data ?? [];

  const firstName = user?.name?.trim().split(/\s+/)[0] ?? 'Mehmon';
  const initials = getInitials(user?.name);

  const addToCart = useCallback(
    (dish: Dish) => {
      useCartStore.getState().add({
        dishId: dish._id,
        name: localizedDishName(dish, i18n.language),
        description: localizedDishDescription(dish, i18n.language),
        price: dish.price,
        image: dish.image,
      });
      showToast(`Savatga qo'shildi: ${localizedDishName(dish, i18n.language)} · ${formatPrice(dish.price)}`);
    },
    [i18n.language, showToast],
  );

  const dismissPush = (enable: boolean) => {
    setPushDismissed(true);
    AsyncStorage.setItem(PUSH_PROMPT_KEY, '1').catch(() => undefined);
    if (enable) {
      if (user) {
        usersApi.updateNotifPrefs({ pushEnabled: true }).catch(() => undefined);
      }
      showToast('Bildirishnomalar yoqildi');
    }
  };

  const header = useMemo(
    () => (
      <View>
        {/* Salomlashuv */}
        <View style={styles.greetingRow}>
          <View style={styles.greetingText}>
            <Text numberOfLines={1} style={[theme.typography.headlineSm, { color: colors.onSurface, letterSpacing: -0.2 }]}>
              {t('home.greeting', { name: firstName, defaultValue: 'Salom, {{name}} 👋' })}
            </Text>
            <Text style={[theme.typography.bodyMd, { color: colors.onSurfaceVariant }]}>
              {t('home.subtitle', { defaultValue: 'Bugun nima yeyishni xohlaysiz?' })}
            </Text>
          </View>
          <Pressable
            onPress={() => router.push('/(tabs)/sozlamalar')}
            style={[styles.greetAvatar, { backgroundColor: colors.primaryFixed }]}
          >
            {initials ? (
              <Text style={[theme.typography.labelLg, { color: colors.onPrimaryFixed, fontFamily: 'Epilogue_700Bold' }]}>
                {initials}
              </Text>
            ) : (
              <Icon name="person" size={22} color={colors.onPrimaryFixed} />
            )}
          </Pressable>
        </View>

        {/* Qidiruv + filtr */}
        <View style={styles.searchRow}>
          <View style={[styles.searchBox, theme.shadows.card, { backgroundColor: colors.surfaceContainerLowest }]}>
            <Icon name="search" size={20} color={colors.onSurfaceVariant} style={styles.searchIcon} />
            <TextInput
              ref={searchRef}
              value={search}
              onChangeText={setSearch}
              placeholder={t('home.search', { defaultValue: 'Taom qidirish...' })}
              placeholderTextColor={colors.outline}
              style={[theme.typography.bodyMd, { flex: 1, color: colors.onSurface, paddingVertical: 0 }]}
              returnKeyType="search"
            />
          </View>
          <Pressable
            accessibilityLabel="Filtr"
            onPress={() => setFilterOpen(true)}
            style={({ pressed }) => [
              styles.filterBtn,
              theme.shadows.card,
              { backgroundColor: colors.surfaceContainerLowest, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <Icon name="tune" size={20} color={sort ? colors.primary : colors.onSurfaceVariant} />
          </Pressable>
        </View>

        {/* Promo banner */}
        <View style={styles.bannerWrap}>
          <LinearGradient
            colors={[colors.primaryContainer, colors.secondaryContainer, colors.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.banner, theme.shadows.raised]}
          >
            <View style={styles.bannerGlow} />
            <View style={styles.bannerBadge}>
              <Text style={[theme.typography.labelSm, { color: colors.onPrimary, fontFamily: 'Inter_600SemiBold' }]}>
                🔥 {t('home.promoBadge', { defaultValue: 'Bugungi aksiya' })}
              </Text>
            </View>
            <Text style={[theme.typography.headlineLgMobile, styles.bannerTitle]}>
              {t('home.promoTitle', { defaultValue: 'Birinchi buyurtmaga 20% chegirma!' })}
            </Text>
            <View style={styles.bannerBottom}>
              <Pressable
                onPress={() => {
                  showToast('Aksiya kodi: BOYXON20 — savatda ishlating', 'info');
                }}
                style={({ pressed }) => [styles.bannerCta, { opacity: pressed ? 0.9 : 1 }]}
              >
                <Text style={[theme.typography.labelMd, { color: colors.primary }]}>
                  {t('home.promoAction', { defaultValue: 'Hoziroq buyurtma' })}
                </Text>
                <Icon name="arrow_forward" size={16} color={colors.primary} />
              </Pressable>
              <View style={styles.dots}>
                <View style={[styles.dotActive]} />
                <View style={styles.dot} />
                <View style={styles.dot} />
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Push-opt-in kartochkasi */}
        {!pushDismissed ? (
          <View style={styles.pushWrap}>
            <View style={[styles.pushCard, theme.shadows.card, { backgroundColor: colors.surfaceContainerLowest }]}>
              <View style={[styles.pushIcon, { backgroundColor: colors.primaryFixed }]}>
                <Icon name="notifications_active" size={20} color={colors.onPrimaryFixed} />
              </View>
              <View style={styles.pushBody}>
                <Text style={[theme.typography.labelMd, { color: colors.onSurface }]}>
                  {t('home.pushTitle', { defaultValue: 'Bildirishnomalarni yoqasizmi?' })}
                </Text>
                <Text style={[theme.typography.bodySm, { color: colors.onSurfaceVariant, marginTop: 2 }]}>
                  {t('home.pushSubtitle', { defaultValue: "Buyurtma holati va aksiyalarni birinchi bo'lib biling" })}
                </Text>
                <View style={styles.pushActions}>
                  <Pressable
                    onPress={() => dismissPush(true)}
                    style={({ pressed }) => [
                      styles.pushPrimary,
                      { backgroundColor: colors.primary, opacity: pressed ? 0.9 : 1 },
                    ]}
                  >
                    <Text style={[theme.typography.labelSm, { color: colors.onPrimary }]}>
                      {t('common.enable', { defaultValue: 'Yoqish' })}
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => dismissPush(false)}
                    style={({ pressed }) => [
                      styles.pushSecondary,
                      { backgroundColor: colors.surfaceVariant, opacity: pressed ? 0.9 : 1 },
                    ]}
                  >
                    <Text style={[theme.typography.labelSm, { color: colors.onSurfaceVariant }]}>
                      {t('common.later', { defaultValue: 'Keyinroq' })}
                    </Text>
                  </Pressable>
                </View>
              </View>
              <Pressable hitSlop={8} onPress={() => dismissPush(false)} style={styles.pushClose}>
                <Icon name="close" size={16} color={colors.onSurfaceVariant} />
              </Pressable>
            </View>
          </View>
        ) : null}

        {/* Kategoriya chiplari */}
        <View style={styles.chipsWrap}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsRow}
          >
            <Chip label={t('home.all', { defaultValue: 'Barchasi' })} active={category === 'all'} onPress={() => setCategory('all')} />
            {categories.map((c) => (
              <Chip
                key={c._id}
                label={
                  i18n.language === 'ru' && c.nameRu
                    ? c.nameRu
                    : i18n.language === 'en' && c.nameEn
                      ? c.nameEn
                      : c.name
                }
                active={category === c.slug}
                onPress={() => setCategory(category === c.slug ? 'all' : c.slug)}
                style={{ marginRight: 8 }}
              />
            ))}
          </ScrollView>
        </View>

        {/* Bo'lim sarlavhasi */}
        <View style={styles.sectionRow}>
          <SectionHeader
            title={t('home.popular', { defaultValue: 'Ommabop taomlar' })}
            actionLabel={
              total > 0 ? t('home.seeAll', { count: total, defaultValue: 'Barchasi ({{count}})' }) : undefined
            }
            onAction={() => {
              setCategory('all');
              setSearch('');
              setSort('');
            }}
          />
        </View>
      </View>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [colors, theme, firstName, initials, pushDismissed, categories, category, sort, total, search, i18n.language],
  );

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar style="light" />
      <AppBar
        subtitle={t('nav.menu', { defaultValue: 'Menyu' })}
        onSearchPress={() => searchRef.current?.focus()}
        onBellPress={() => router.push('/bildirishnomalar')}
        onAvatarPress={() => router.push('/(tabs)/sozlamalar')}
      />
      <FlatList
        data={dishes}
        keyExtractor={(d) => d._id}
        renderItem={({ item }) => (
          <DishRow
            dish={item}
            onAdd={() => addToCart(item)}
            onPress={() => router.push({ pathname: '/taom/[slug]', params: { slug: item.slug } })}
          />
        )}
        ListHeaderComponent={header}
        ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={listQ.isFetching && !listQ.isLoading}
            onRefresh={() => {
              listQ.refetch();
              categoriesQ.refetch();
            }}
            tintColor={colors.primaryContainer}
            colors={[colors.primaryContainer]}
          />
        }
        ListEmptyComponent={
          listQ.isLoading ? (
            <View style={styles.loading}>
              <ActivityIndicator size="large" color={colors.primaryContainer} />
            </View>
          ) : listQ.isError ? (
            <EmptyState
              icon="wifi-off"
              title="Ulanishda xatolik"
              subtitle="Internetni tekshirib, qayta urinib ko'ring"
              actionLabel="Qayta urinish"
              onAction={() => listQ.refetch()}
            />
          ) : (
            <EmptyState
              icon="search-off"
              title="Taom topilmadi"
              subtitle="Boshqa nom bilan qidirib ko'ring yoki kategoriyani o'zgartiring"
            />
          )
        }
      />

      {/* Filtr bottom-sheet */}
      <Modal visible={filterOpen} transparent animationType="fade" onRequestClose={() => setFilterOpen(false)}>
        <View style={styles.modalRoot}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setFilterOpen(false)} />
          <View style={[styles.filterSheet, { backgroundColor: colors.surfaceContainerLowest }]}>
            <View style={styles.filterHeader}>
              <Text style={[theme.typography.headlineSm, { color: colors.onSurface }]}>
                {t('home.filterTitle', { defaultValue: 'Saralash' })}
              </Text>
              <Pressable hitSlop={8} onPress={() => setFilterOpen(false)}>
                <Icon name="close" size={20} color={colors.onSurfaceVariant} />
              </Pressable>
            </View>
            {SORT_OPTIONS.map((opt) => {
              const active = sort === opt.key;
              return (
                <Pressable
                  key={opt.key}
                  onPress={() => {
                    setSort(active ? '' : opt.key);
                    setFilterOpen(false);
                  }}
                  style={styles.filterRow}
                >
                  <Text style={[theme.typography.bodyLg, { color: colors.onSurface }]}>{opt.label}</Text>
                  {active ? <Icon name="check" size={20} color={colors.primary} /> : null}
                </Pressable>
              );
            })}
            {sort ? (
              <Pressable
                onPress={() => {
                  setSort('');
                  setFilterOpen(false);
                }}
                style={styles.filterReset}
              >
                <Text style={[theme.typography.labelLg, { color: colors.primary }]}>
                  {t('common.reset', { defaultValue: 'Tozalash' })}
                </Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  list: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 24 },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    paddingVertical: 8,
  },
  greetingText: { flex: 1, minWidth: 0 },
  greetAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 },
  searchBox: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 36,
    paddingRight: 16,
  },
  searchIcon: { position: 'absolute', left: 14 },
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerWrap: { paddingTop: 16, paddingBottom: 4 },
  banner: {
    borderRadius: 16,
    padding: 16,
    overflow: 'hidden',
  },
  bannerGlow: {
    position: 'absolute',
    right: -24,
    bottom: -24,
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  bannerBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  bannerTitle: {
    color: '#ffffff',
    marginTop: 2,
    maxWidth: 240,
  },
  bannerBottom: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  dots: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dotActive: { width: 10, height: 6, borderRadius: 3, backgroundColor: '#ffffff' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.5)' },
  pushWrap: { paddingTop: 8, paddingBottom: 4 },
  pushCard: {
    borderRadius: 12,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  pushIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pushBody: { flex: 1, minWidth: 0 },
  pushActions: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  pushPrimary: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 4 },
  pushSecondary: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 4 },
  pushClose: { padding: 2 },
  chipsWrap: { paddingTop: 16, paddingBottom: 8, marginHorizontal: -16 },
  chipsRow: { paddingHorizontal: 16, gap: 8 },
  sectionRow: { paddingTop: 4, paddingBottom: 16 },
  card: {
    flexDirection: 'row',
    gap: 8,
    borderRadius: 12,
    padding: 8,
  },
  thumb: { width: 96, height: 96, borderRadius: 12 },
  cardBody: { flex: 1, minWidth: 0, justifyContent: 'space-between' },
  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 4,
  },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  loading: { paddingVertical: 48, alignItems: 'center' },
  modalRoot: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.45)' },
  filterSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 32,
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  filterRow: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filterReset: { alignItems: 'center', paddingTop: 12 },
});
