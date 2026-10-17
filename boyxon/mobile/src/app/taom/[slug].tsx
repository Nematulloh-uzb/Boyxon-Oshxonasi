import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { authApi } from '../../api/auth.api';
import { apiErrorMessage } from '../../api/client';
import { dishesApi } from '../../api/dishes.api';
import { usersApi } from '../../api/users.api';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { Icon } from '../../components/Icon';
import { QtyStepper } from '../../components/QtyStepper';
import { formatPrice, localizedDishDescription, localizedDishName } from '../../lib/format';
import { useAuthStore } from '../../store/auth.store';
import { useCartStore } from '../../store/cart.store';
import { useToastStore } from '../../store/toast.store';
import { useTheme } from '../../theme/ThemeProvider';

/** Taom detali — Stitch dizayn tilida (rasm + ma'lumot + pastki CTA). */
export default function TaomScreen() {
  const theme = useTheme();
  const { colors, isDark } = theme;
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t, i18n } = useTranslation();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const showToast = useToastStore((s) => s.show);
  const user = useAuthStore((s) => s.user);
  const [qty, setQty] = useState(1);
  const [favBusy, setFavBusy] = useState(false);

  const dishQ = useQuery({
    queryKey: ['dish', slug],
    queryFn: () => dishesApi.detail(slug as string),
    enabled: !!slug,
  });
  const dish = dishQ.data?.data.dish;
  const isFav = !!(dish && user?.favorites?.includes(dish._id));

  const toggleFav = async () => {
    if (!dish) return;
    if (!user) {
      router.push('/kirish');
      return;
    }
    setFavBusy(true);
    try {
      const res = await usersApi.toggleFavorite(dish._id);
      const me = await authApi.me();
      useAuthStore.getState().setUser(me.data);
      showToast(res.data.favored ? "Sevimlilarga qo'shildi" : 'Sevimlilardan olindi');
    } catch (e) {
      showToast(apiErrorMessage(e), 'error');
    } finally {
      setFavBusy(false);
    }
  };

  const addToCart = () => {
    if (!dish) return;
    useCartStore.getState().add(
      {
        dishId: dish._id,
        name: localizedDishName(dish, i18n.language),
        description: localizedDishDescription(dish, i18n.language),
        price: dish.price,
        image: dish.image,
      },
      qty,
    );
    showToast(
      `Savatga qo'shildi: ${localizedDishName(dish, i18n.language)} · ${formatPrice(dish.price * qty)}`,
    );
  };

  const headerBtn = {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: 'rgba(255,255,255,0.92)',
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar style={dish?.image ? 'light' : isDark ? 'light' : 'dark'} />

      <Pressable
        accessibilityLabel="Orqaga"
        onPress={() => router.back()}
        style={[headerBtn, styles.backFloat, { top: insets.top + 8 }]}
      >
        <Icon name="arrow_back" size={22} color="#1c1b1b" />
      </Pressable>
      <Pressable
        accessibilityLabel="Sevimlilar"
        onPress={favBusy ? undefined : toggleFav}
        style={[headerBtn, styles.favFloat, { top: insets.top + 8 }]}
      >
        <Icon
          name={isFav ? 'favorite' : 'favorite_border'}
          size={22}
          color={isFav ? colors.primaryContainer : '#1c1b1b'}
        />
      </Pressable>

      {dishQ.isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primaryContainer} />
        </View>
      ) : !dish ? (
        <View style={[styles.center, { paddingTop: insets.top + 60 }]}>
          <EmptyState
            icon="error-outline"
            title="Taom topilmadi"
            subtitle="Bu taom o'chirilgan yoki mavjud emas"
            actionLabel="Orqaga"
            onAction={() => router.back()}
          />
        </View>
      ) : (
        <>
          <ScrollView
            contentContainerStyle={{ paddingBottom: 140 + insets.bottom }}
            showsVerticalScrollIndicator={false}
          >
            {/* Rasm */}
            <View style={[styles.hero, { backgroundColor: colors.surfaceContainerLow }]}>
              {dish.image ? (
                <Image source={{ uri: dish.image }} style={styles.heroImg} contentFit="cover" transition={200} />
              ) : (
                <View style={styles.center}>
                  <Icon name="restaurant" size={44} color={colors.outline} style={{ opacity: 0.4 }} />
                  <Text
                    style={[
                      theme.typography.bodySm,
                      { color: colors.onSurfaceVariant, marginTop: 6, fontWeight: '500' },
                    ]}
                  >
                    {"Rasm yo'q"}
                  </Text>
                </View>
              )}
            </View>

            {/* Kontent */}
            <View
              style={[
                styles.content,
                { backgroundColor: colors.background, marginTop: -24 },
              ]}
            >
              <Text style={[theme.typography.headlineLgMobile, { color: colors.onSurface }]}>
                {localizedDishName(dish, i18n.language)}
              </Text>

              <View style={styles.metaRow}>
                {dish.rating > 0 ? (
                  <View style={styles.metaItem}>
                    <Icon name="star" size={16} color={colors.primary} />
                    <Text
                      style={[
                        theme.typography.labelMd,
                        { color: colors.onSurface, fontFamily: 'Inter_600SemiBold' },
                      ]}
                    >
                      {dish.rating.toFixed(1)}
                    </Text>
                    {dish.reviewCount > 0 ? (
                      <Text style={[theme.typography.bodySm, { color: colors.onSurfaceVariant }]}>
                        ({dish.reviewCount})
                      </Text>
                    ) : null}
                  </View>
                ) : null}
                {dish.deliveryTime ? (
                  <View style={styles.metaItem}>
                    <Icon name="schedule" size={16} color={colors.secondary} />
                    <Text style={[theme.typography.labelMd, { color: colors.onSurfaceVariant }]}>
                      {dish.deliveryTime} {t('dish.minutes', { defaultValue: 'daqiqa' })}
                    </Text>
                  </View>
                ) : null}
                {dish.calories ? (
                  <View style={styles.metaItem}>
                    <Icon name="local_fire_department" size={16} color={colors.secondary} />
                    <Text style={[theme.typography.labelMd, { color: colors.onSurfaceVariant }]}>
                      {dish.calories} kcal
                    </Text>
                  </View>
                ) : null}
              </View>

              <View style={styles.priceRow}>
                <Text
                  style={[
                    theme.typography.headlineSm,
                    { color: colors.primary, fontFamily: 'Epilogue_700Bold' },
                  ]}
                >
                  {formatPrice(dish.price)}
                </Text>
                {dish.oldPrice && dish.oldPrice > dish.price ? (
                  <Text
                    style={[
                      theme.typography.bodyMd,
                      { color: colors.outline, textDecorationLine: 'line-through', marginLeft: 8 },
                    ]}
                  >
                    {formatPrice(dish.oldPrice)}
                  </Text>
                ) : null}
              </View>

              <Text
                style={[
                  theme.typography.bodyMd,
                  { color: colors.onSurfaceVariant, marginTop: 10, lineHeight: 22 },
                ]}
              >
                {localizedDishDescription(dish, i18n.language)}
              </Text>

              {dish.tags?.length ? (
                <View style={styles.tagsRow}>
                  {dish.tags.map((tag) => (
                    <View
                      key={tag}
                      style={[styles.tag, { backgroundColor: colors.surfaceContainerLow }]}
                    >
                      <Text style={[theme.typography.labelSm, { color: colors.onSurfaceVariant }]}>
                        {tag}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>
          </ScrollView>

          {/* Pastki panel */}
          <View
            style={[
              styles.bottomBar,
              theme.shadows.raised,
              {
                backgroundColor: colors.surfaceContainerLowest,
                paddingBottom: insets.bottom + 12,
              },
            ]}
          >
            <QtyStepper value={qty} onChange={setQty} min={1} max={20} />
            <Button
              title={`Savatga · ${formatPrice(dish.price * qty)}`}
              icon="add"
              size="lg"
              onPress={addToCart}
              style={{ flex: 1, backgroundColor: colors.primaryContainer }}
            />
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  backFloat: { position: 'absolute', left: 16, zIndex: 10 },
  favFloat: { position: 'absolute', right: 16, zIndex: 10 },
  hero: { height: 300, overflow: 'hidden' },
  heroImg: { width: '100%', height: '100%' },
  content: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 10, flexWrap: 'wrap' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 10 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
});
