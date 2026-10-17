import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { apiErrorMessage } from '../../api/client';
import { authApi } from '../../api/auth.api';
import { ordersApi } from '../../api/orders.api';
import type { Address, Order, OrderStatus } from '../../api/types';
import { promosApi, usersApi } from '../../api/users.api';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { Icon } from '../../components/Icon';
import { Input } from '../../components/Input';
import { Placeholder } from '../../components/Placeholder';
import { QtyStepper } from '../../components/QtyStepper';
import { SegmentedControl } from '../../components/SegmentedControl';
import { calcDeliveryFee, PUSH_PROMPT_KEY } from '../../lib/constants';
import { formatPrice } from '../../lib/format';
import { useAuthStore } from '../../store/auth.store';
import { useCartStore, type CartLine } from '../../store/cart.store';
import { useToastStore } from '../../store/toast.store';
import { useTheme } from '../../theme/ThemeProvider';

const PAYMENTS = [
  { key: 'payme', label: 'Payme', mark: 'P' },
  { key: 'click', label: 'Click', mark: 'C' },
  { key: 'uzum', label: 'Uzum Bank', mark: 'U' },
  { key: 'cash', label: 'Naqd pul', mark: '', icon: 'payments' },
] as const;

type PaymentKey = (typeof PAYMENTS)[number]['key'];

const STEPS = ['Qabul qilindi', 'Oshxonada', "Yo'lda", 'Yetkazildi'];

const STATUS_INDEX: Record<OrderStatus, number> = {
  pending: 0,
  confirmed: 0,
  packing: 1,
  handed_to_taxi: 2,
  delivered: 3,
  cancelled: 0,
};

/** Savat qatori (dizayn 03): rasm + nom/tavsif/narx + QtyStepper. */
function CartRow({ line }: { line: CartLine }) {
  const theme = useTheme();
  const { colors } = theme;
  const setQty = useCartStore((s) => s.setQty);
  return (
    <View style={[styles.itemRow, theme.shadows.card, { backgroundColor: colors.surfaceContainerLowest }]}>
      {line.image ? (
        <Image source={{ uri: line.image }} style={styles.itemImg} contentFit="cover" transition={150} />
      ) : (
        <Placeholder size={80} showLabel={false} />
      )}
      <View style={styles.itemBody}>
        <View>
          <Text
            numberOfLines={1}
            style={[theme.typography.labelLg, { color: colors.onSurface, fontFamily: 'Inter_600SemiBold' }]}
          >
            {line.name}
          </Text>
          {line.description ? (
            <Text
              numberOfLines={1}
              style={[theme.typography.bodySm, { color: colors.onSurfaceVariant, marginTop: 2 }]}
            >
              {line.description}
            </Text>
          ) : null}
        </View>
        <View style={styles.itemBottom}>
          <Text
            style={[theme.typography.labelLg, { color: colors.primary, fontFamily: 'Epilogue_600SemiBold', fontSize: 17 }]}
          >
            {formatPrice(line.price * line.quantity)}
          </Text>
          <QtyStepper value={line.quantity} onChange={(v) => setQty(line.dishId, v)} min={0} max={20} />
        </View>
      </View>
    </View>
  );
}

/** Dizayn 03: Savat va to'lov (checkout). */
export default function SavatScreen() {
  const theme = useTheme();
  const { colors, isDark } = theme;
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const showToast = useToastStore((s) => s.show);
  const queryClient = useQueryClient();

  const lines = useCartStore((s) => s.lines);
  const promoCode = useCartStore((s) => s.promoCode);
  const storedDiscount = useCartStore((s) => s.discount);
  const setPromo = useCartStore((s) => s.setPromo);
  const clearCart = useCartStore((s) => s.clear);
  const user = useAuthStore((s) => s.user);

  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');
  const [payment, setPayment] = useState<PaymentKey>('payme');
  const [promoInput, setPromoInput] = useState('');
  const [applyingPromo, setApplyingPromo] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [successOrder, setSuccessOrder] = useState<Order | null>(null);

  const [pushDismissed, setPushDismissed] = useState(true);

  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [addrFormOpen, setAddrFormOpen] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newIsDefault, setNewIsDefault] = useState(false);
  const [savingAddr, setSavingAddr] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | undefined>(undefined);

  useEffect(() => {
    AsyncStorage.getItem(PUSH_PROMPT_KEY)
      .then((v) => setPushDismissed(v === '1'))
      .catch(() => setPushDismissed(false));
  }, []);

  const subtotal = useMemo(() => lines.reduce((s, l) => s + l.price * l.quantity, 0), [lines]);
  const count = useMemo(() => lines.reduce((s, l) => s + l.quantity, 0), [lines]);
  const deliveryFee = calcDeliveryFee(subtotal, deliveryType);
  const discount = Math.min(storedDiscount, subtotal);
  const total = subtotal + deliveryFee - discount;

  const addresses = user?.addresses ?? [];
  const selectedAddress = useMemo<Address | undefined>(() => {
    if (selectedAddressId) {
      const found = addresses.find((a) => a._id === selectedAddressId);
      if (found) return found;
    }
    return addresses.find((a) => a.isDefault) ?? addresses[0];
  }, [addresses, selectedAddressId]);

  const dismissPush = (enable: boolean) => {
    setPushDismissed(true);
    AsyncStorage.setItem(PUSH_PROMPT_KEY, '1').catch(() => undefined);
    if (enable) {
      if (user) usersApi.updateNotifPrefs({ pushEnabled: true }).catch(() => undefined);
      showToast("Bildirishnomalar yoqildi");
    }
  };

  const applyPromo = async () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) return;
    setApplyingPromo(true);
    try {
      const res = await promosApi.validate(code, subtotal);
      setPromo(res.data.code, res.data.discount);
      setPromoInput('');
      showToast(
        res.data.description
          ? `${res.data.code}: ${res.data.description}`
          : "Promo kod qo'llanildi",
        'success',
      );
    } catch (e) {
      showToast(apiErrorMessage(e, 'Promo kod yaroqsiz'), 'error');
    } finally {
      setApplyingPromo(false);
    }
  };

  const saveAddress = async () => {
    if (newAddress.trim().length < 5) {
      showToast("Manzilni to'liq kiriting", 'error');
      return;
    }
    setSavingAddr(true);
    try {
      await usersApi.addAddress({
        label: newLabel.trim() || 'Manzil',
        address: newAddress.trim(),
        isDefault: newIsDefault,
      });
      const me = await authApi.me();
      useAuthStore.getState().setUser(me.data);
      const added = me.data.addresses[me.data.addresses.length - 1];
      if (added?._id) setSelectedAddressId(added._id);
      setNewLabel('');
      setNewAddress('');
      setNewIsDefault(false);
      setAddrFormOpen(false);
      showToast("Manzil qo'shildi", 'success');
    } catch (e) {
      showToast(apiErrorMessage(e, "Manzil qo'shilmadi"), 'error');
    } finally {
      setSavingAddr(false);
    }
  };

  const confirmClear = () => {
    Alert.alert("Savatni tozalash", "Barcha taomlar o'chiriladi. Davom etasizmi?", [
      { text: 'Bekor qilish', style: 'cancel' },
      { text: 'Tozalash', style: 'destructive', onPress: () => clearCart() },
    ]);
  };

  const handleCheckout = async () => {
    if (lines.length === 0 || placing) return;
    if (!user) {
      router.push({ pathname: '/kirish', params: { returnTo: '/(tabs)/savat' } });
      return;
    }
    if (deliveryType === 'delivery' && !selectedAddress) {
      setAddressModalOpen(true);
      showToast('Yetkazish manzilini tanlang', 'info');
      return;
    }
    setPlacing(true);
    try {
      const res = await ordersApi.create({
        items: lines.map((l) => ({ dish: l.dishId, quantity: l.quantity })),
        deliveryType,
        address:
          deliveryType === 'delivery' && selectedAddress
            ? { label: selectedAddress.label, address: selectedAddress.address }
            : undefined,
        paymentMethod: payment,
        promoCode,
      });
      clearCart();
      setSuccessOrder(res.data);
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    } catch (e) {
      showToast(apiErrorMessage(e, 'Buyurtma yaratilmadi'), 'error');
    } finally {
      setPlacing(false);
    }
  };

  const closeSuccessToTrack = () => {
    const order = successOrder;
    setSuccessOrder(null);
    if (order) router.replace({ pathname: '/buyurtma/[id]', params: { id: order._id } });
  };

  const closeSuccessToHome = () => {
    setSuccessOrder(null);
    router.replace('/(tabs)');
  };

  const stepIndex = successOrder ? (STATUS_INDEX[successOrder.status] ?? 0) : 0;
  const progress = ((stepIndex + 1) / STEPS.length) * 100;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Sarlavha */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable
          accessibilityLabel="Orqaga"
          onPress={() => router.navigate('/(tabs)')}
          style={({ pressed }) => [
            styles.backBtn,
            { backgroundColor: colors.surfaceContainer, opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <Icon name="arrow_back" size={22} color={colors.onSurface} />
        </Pressable>
        <View style={styles.headerTitle}>
          <Text style={[theme.typography.headlineMd, { color: colors.onSurface }]}>Savatim</Text>
          {count > 0 ? (
            <Text style={[theme.typography.labelSm, { color: colors.onSurfaceVariant }]}>
              {count} ta taom · {formatPrice(subtotal)}
            </Text>
          ) : null}
        </View>
        {lines.length > 0 ? (
          <Pressable onPress={confirmClear} hitSlop={8} style={styles.clearBtn}>
            <Icon name="delete_sweep" size={16} color={colors.secondary} />
            <Text style={[theme.typography.labelMd, { color: colors.secondary }]}>Tozalash</Text>
          </Pressable>
        ) : null}
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={[styles.scroll, { paddingBottom: 32 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {lines.length === 0 ? (
          <EmptyState
            icon="shopping-bag"
            title="Savat bo'sh"
            subtitle="Taomlarni tanlab, savatga qo'shing — biz tez yetkazamiz"
            actionLabel="Xaridni boshlash"
            onAction={() => router.navigate('/(tabs)')}
          />
        ) : (
          <>
            {/* Push-opt-in banner */}
            {!pushDismissed ? (
              <View
                style={[
                  styles.pushRow,
                  theme.shadows.card,
                  { backgroundColor: colors.surfaceContainerLowest },
                ]}
              >
                <View style={[styles.pushIcon, { backgroundColor: colors.primaryFixed }]}>
                  <Icon name="notifications_active" size={18} color={colors.onPrimaryFixed} />
                </View>
                <Text
                  style={[
                    theme.typography.bodySm,
                    { flex: 1, color: colors.onSurface, fontFamily: 'Inter_500Medium' },
                  ]}
                >
                  {t('cart.pushPrompt', {
                    defaultValue: "Buyurtma holatini kuzatishni yoqasizmi?",
                  })}
                </Text>
                <Pressable
                  onPress={() => dismissPush(true)}
                  style={({ pressed }) => [
                    styles.pushBtn,
                    { backgroundColor: colors.primaryContainer, opacity: pressed ? 0.9 : 1 },
                  ]}
                >
                  <Text style={[theme.typography.labelSm, { color: colors.onPrimary }]}>
                    {t('common.enable', { defaultValue: 'Yoqish' })}
                  </Text>
                </Pressable>
              </View>
            ) : null}

            {/* Taomlar */}
            <View style={styles.items}>
              {lines.map((line) => (
                <CartRow key={line.dishId} line={line} />
              ))}
            </View>

            <Pressable
              onPress={() => router.navigate('/(tabs)')}
              style={({ pressed }) => [
                styles.addMore,
                { backgroundColor: colors.surfaceContainerLow, opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <Icon name="add_circle" size={20} color={colors.primary} />
              <Text style={[theme.typography.labelLg, { color: colors.primary }]}>
                {t('cart.addMore', { defaultValue: "Yana taom qo'shish" })}
              </Text>
            </Pressable>

            {/* Yetkazish turi */}
            <SegmentedControl
              variant="solid"
              items={[
                { key: 'delivery', label: 'Yetkazib berish', icon: 'two_wheeler' },
                { key: 'pickup', label: 'Olib ketish', icon: 'directions_walk' },
              ]}
              value={deliveryType}
              onChange={(k) => setDeliveryType(k as 'delivery' | 'pickup')}
            />

            {/* Manzil */}
            {deliveryType === 'delivery' ? (
              <Pressable
                onPress={() => setAddressModalOpen(true)}
                style={({ pressed }) => [
                  styles.addrCard,
                  theme.shadows.card,
                  { backgroundColor: colors.surfaceContainerLowest, opacity: pressed ? 0.95 : 1 },
                ]}
              >
                <View style={[styles.addrIcon, { backgroundColor: colors.secondaryFixed }]}>
                  <Icon name="location_on" size={22} color={colors.onSecondaryFixed} />
                </View>
                <View style={styles.addrBody}>
                  <Text style={[theme.typography.labelSm, { color: colors.onSurfaceVariant }]}>
                    {t('cart.addressTitle', { defaultValue: 'Yetkazish manzili' })}
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={[
                      theme.typography.labelLg,
                      { color: colors.onSurface, fontFamily: 'Inter_500Medium', marginTop: 2 },
                    ]}
                  >
                    {selectedAddress
                      ? `${selectedAddress.label ? selectedAddress.label + ' · ' : ''}${selectedAddress.address}`
                      : "Manzil qo'shish"}
                  </Text>
                </View>
                <Text style={[theme.typography.labelMd, { color: colors.secondary }]}>
                  {t('common.change', { defaultValue: "O'zgartirish" })}
                </Text>
              </Pressable>
            ) : null}

            {/* Promo kod */}
            {promoCode ? (
              <View
                style={[
                  styles.promoBadge,
                  { backgroundColor: isDark ? colors.tertiaryFixed : 'rgba(126,251,164,0.3)' },
                ]}
              >
                <Icon name="celebration" size={20} color={colors.tertiary} />
                <Text
                  style={[theme.typography.labelMd, { flex: 1, color: colors.onTertiaryFixedVariant }]}
                >
                  {promoCode} {t('cart.promoApplied', { defaultValue: "qo'llanildi" })}
                </Text>
                <Text
                  style={[
                    theme.typography.labelLg,
                    { color: colors.tertiary, fontFamily: 'Inter_600SemiBold' },
                  ]}
                >
                  -{formatPrice(discount)}
                </Text>
                <Pressable hitSlop={8} onPress={() => setPromo(undefined, 0)}>
                  <Icon name="close" size={16} color={colors.onTertiaryFixedVariant} />
                </Pressable>
              </View>
            ) : (
              <View style={styles.promoRow}>
                <Input
                  icon="local_offer"
                  placeholder={t('cart.promoPlaceholder', { defaultValue: 'Promo kod' })}
                  value={promoInput}
                  onChangeText={setPromoInput}
                  autoCapitalize="characters"
                  style={styles.flex}
                  onSubmitEditing={applyPromo}
                />
                <Button
                  title={t('cart.apply', { defaultValue: "Qo'llash" })}
                  size="lg"
                  full={false}
                  loading={applyingPromo}
                  onPress={applyPromo}
                  style={{ paddingHorizontal: 20 }}
                />
              </View>
            )}

            {/* To'lov usuli */}
            <View style={styles.payGrid}>
              {PAYMENTS.map((p) => {
                const active = payment === p.key;
                return (
                  <Pressable
                    key={p.key}
                    onPress={() => setPayment(p.key)}
                    style={({ pressed }) => [
                      styles.payCard,
                      active && theme.shadows.card,
                      {
                        backgroundColor: active
                          ? colors.surfaceContainerLowest
                          : colors.surfaceContainerLow,
                        borderWidth: active ? 1 : 0,
                        borderColor: colors.primaryContainer,
                        opacity: pressed ? 0.9 : 1,
                      },
                    ]}
                  >
                    <View style={[styles.payMark, { backgroundColor: colors.surfaceContainerHigh }]}>
                      {'icon' in p && p.icon ? (
                        <Icon name={p.icon} size={16} color={colors.onSurface} />
                      ) : (
                        <Text
                          style={[
                            theme.typography.labelSm,
                            { color: colors.onSurface, fontFamily: 'Epilogue_700Bold' },
                          ]}
                        >
                          {p.mark}
                        </Text>
                      )}
                    </View>
                    <Text
                      numberOfLines={1}
                      style={[theme.typography.labelMd, { flex: 1, color: colors.onSurface }]}
                    >
                      {p.label}
                    </Text>
                    <Icon
                      name={active ? 'check_circle' : 'radio_button_unchecked'}
                      size={18}
                      color={active ? colors.primary : colors.outline}
                      style={active ? undefined : { opacity: 0.4 }}
                    />
                  </Pressable>
                );
              })}
            </View>

            {/* Hisob-kitob */}
            <View
              style={[styles.summary, theme.shadows.card, { backgroundColor: colors.surfaceContainerLowest }]}
            >
              <View style={styles.summaryRow}>
                <Text style={[theme.typography.bodyMd, { color: colors.onSurfaceVariant }]}>
                  {t('cart.items', { defaultValue: 'Taomlar' })}
                </Text>
                <Text style={[theme.typography.labelLg, { color: colors.onSurface }]}>
                  {formatPrice(subtotal)}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={[theme.typography.bodyMd, { color: colors.onSurfaceVariant }]}>
                  {t('cart.delivery', { defaultValue: 'Yetkazib berish' })}
                </Text>
                {deliveryFee > 0 ? (
                  <Text style={[theme.typography.labelLg, { color: colors.onSurface }]}>
                    {formatPrice(deliveryFee)}
                  </Text>
                ) : (
                  <Text style={[theme.typography.labelLg, { color: colors.tertiary }]}>
                    {t('cart.free', { defaultValue: 'Bepul' })}
                  </Text>
                )}
              </View>
              {discount > 0 ? (
                <View style={styles.summaryRow}>
                  <Text style={[theme.typography.bodyMd, { color: colors.onSurfaceVariant }]}>
                    {t('cart.discount', { defaultValue: 'Chegirma' })}
                  </Text>
                  <Text style={[theme.typography.labelLg, { color: colors.tertiary }]}>
                    -{formatPrice(discount)}
                  </Text>
                </View>
              ) : null}
              <View style={[styles.summaryDivider, { backgroundColor: colors.surfaceContainerHigh }]} />
              <View style={styles.summaryRow}>
                <Text
                  style={[
                    theme.typography.headlineSm,
                    { color: colors.onSurface, fontFamily: 'Epilogue_600SemiBold', fontSize: 18 },
                  ]}
                >
                  {t('cart.total', { defaultValue: 'Jami' })}
                </Text>
                <Text
                  style={[
                    theme.typography.headlineSm,
                    { color: colors.primary, fontFamily: 'Epilogue_600SemiBold', fontSize: 18 },
                  ]}
                >
                  {formatPrice(total)}
                </Text>
              </View>
            </View>

            {/* CTA */}
            <Button
              title={`${t('cart.checkout', { defaultValue: "To'lovni tasdiqlash" })} · ${formatPrice(total)}`}
              variant="primary"
              size="lg"
              icon="check"
              loading={placing}
              onPress={handleCheckout}
              style={{ backgroundColor: colors.primaryContainer }}
            />
          </>
        )}
      </ScrollView>

      {/* Manzil modali */}
      <Modal
        visible={addressModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setAddressModalOpen(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalRoot}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setAddressModalOpen(false)} />
          <View style={[styles.sheet, { backgroundColor: colors.surfaceContainerLowest }]}>
            <View style={styles.sheetHeader}>
              <Text style={[theme.typography.headlineSm, { color: colors.onSurface }]}>
                {t('cart.addressTitle', { defaultValue: 'Yetkazish manzili' })}
              </Text>
              <Pressable hitSlop={8} onPress={() => setAddressModalOpen(false)}>
                <Icon name="close" size={20} color={colors.onSurfaceVariant} />
              </Pressable>
            </View>
            <ScrollView keyboardShouldPersistTaps="handled" style={styles.flex}>
              {addresses.map((a) => {
                const active = selectedAddress?._id === a._id;
                return (
                  <Pressable
                    key={a._id ?? a.address}
                    onPress={() => {
                      setSelectedAddressId(a._id);
                      setAddressModalOpen(false);
                    }}
                    style={styles.addrRow}
                  >
                    <Icon
                      name={active ? 'radio_button_checked' : 'radio_button_unchecked'}
                      size={22}
                      color={active ? colors.primary : colors.outline}
                    />
                    <View style={styles.flex}>
                      <Text
                        style={[
                          theme.typography.labelLg,
                          { color: colors.onSurface, fontFamily: 'Inter_500Medium' },
                        ]}
                      >
                        {a.label}
                        {a.isDefault ? ' · default' : ''}
                      </Text>
                      <Text
                        numberOfLines={2}
                        style={[theme.typography.bodySm, { color: colors.onSurfaceVariant, marginTop: 2 }]}
                      >
                        {a.address}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}

              {!addrFormOpen ? (
                <Pressable
                  onPress={() => setAddrFormOpen(true)}
                  style={({ pressed }) => [
                    styles.addNewRow,
                    { borderColor: colors.outlineVariant, opacity: pressed ? 0.8 : 1 },
                  ]}
                >
                  <Icon name="add" size={20} color={colors.primary} />
                  <Text style={[theme.typography.labelLg, { color: colors.primary }]}>
                    {t('cart.newAddress', { defaultValue: 'Yangi manzil' })}
                  </Text>
                </Pressable>
              ) : (
                <View style={styles.addrForm}>
                  <Input
                    label={t('cart.addressLabel', { defaultValue: 'Nomi' })}
                    icon="bookmark"
                    value={newLabel}
                    onChangeText={setNewLabel}
                    placeholder="Uy / Ish"
                    autoCapitalize="words"
                  />
                  <Input
                    label={t('cart.addressText', { defaultValue: 'Manzil' })}
                    icon="location_on"
                    value={newAddress}
                    onChangeText={setNewAddress}
                    placeholder="Chilonzor, 19-kvartal, 12-uy"
                  />
                  <Pressable style={styles.checkRow} onPress={() => setNewIsDefault((v) => !v)}>
                    <View
                      style={[
                        styles.checkbox,
                        {
                          borderColor: newIsDefault ? colors.primaryContainer : colors.outline,
                          backgroundColor: newIsDefault ? colors.primaryContainer : 'transparent',
                        },
                      ]}
                    >
                      {newIsDefault ? <Icon name="check" size={12} color={colors.onPrimary} /> : null}
                    </View>
                    <Text style={[theme.typography.labelSm, { color: colors.onSurfaceVariant }]}>
                      {t('cart.setDefault', { defaultValue: "Asosiy manzil qilish" })}
                    </Text>
                  </Pressable>
                  <Button
                    title={t('common.save', { defaultValue: 'Saqlash' })}
                    variant="primary"
                    size="md"
                    loading={savingAddr}
                    onPress={saveAddress}
                    style={{ backgroundColor: colors.primaryContainer }}
                  />
                </View>
              )}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Muvaffaqiyat modali */}
      <Modal
        visible={!!successOrder}
        transparent
        animationType="slide"
        onRequestClose={() => setSuccessOrder(null)}
      >
        <View style={styles.successRoot}>
          <View style={styles.successBackdrop} />
          <View style={[styles.successSheet, { backgroundColor: colors.surfaceContainerLowest }]}>
            <View style={styles.successTop}>
              <View style={styles.successIconOuter}>
                <View style={[styles.successIconInner, { backgroundColor: colors.tertiaryContainer }]}>
                  <Icon name="check" size={28} color="#ffffff" />
                </View>
              </View>
              <Text style={[theme.typography.headlineMd, { color: colors.onSurface, textAlign: 'center' }]}>
                {t('cart.successTitle', { defaultValue: 'Buyurtma qabul qilindi!' })}
              </Text>
              <Text
                style={[
                  theme.typography.bodyMd,
                  { color: colors.onSurfaceVariant, textAlign: 'center', marginTop: 6 },
                ]}
              >
                {t('cart.successText', {
                  defaultValue:
                    "Buyurtmangiz muvaffaqiyatli qabul qilindi. Tez orada siz bilan bog'lanamiz.",
                })}
              </Text>
            </View>

            <View style={[styles.tracker, { backgroundColor: colors.surfaceContainerLow }]}>
              {STEPS.map((label, i) => {
                const done = i < stepIndex;
                const current = i === stepIndex;
                return (
                  <View key={label} style={styles.trackerRow}>
                    <View
                      style={[
                        styles.trackerDot,
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

            <Button
              title={t('cart.trackOrder', { defaultValue: 'Buyurtmani kuzatish' })}
              variant="primary"
              size="md"
              onPress={closeSuccessToTrack}
              style={{ backgroundColor: colors.primaryContainer, marginTop: 16 }}
            />
            <Pressable onPress={closeSuccessToHome} style={styles.homeLink}>
              <Text style={[theme.typography.labelMd, { color: colors.onSurfaceVariant }]}>
                {t('cart.backHome', { defaultValue: 'Bosh sahifaga qaytish' })}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingTop: 12, gap: 12 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { flex: 1, minWidth: 0 },
  clearBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  pushRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    padding: 10,
  },
  pushIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pushBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 9999,
  },
  items: { gap: 12 },
  itemRow: { flexDirection: 'row', gap: 10, borderRadius: 12, padding: 10 },
  itemImg: { width: 80, height: 80, borderRadius: 12 },
  itemBody: { flex: 1, minWidth: 0, justifyContent: 'space-between' },
  itemBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  addMore: {
    height: 44,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addrCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 12,
    padding: 12,
  },
  addrIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addrBody: { flex: 1, minWidth: 0 },
  promoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  promoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  payGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  payCard: {
    flexBasis: '48%',
    flexGrow: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    padding: 10,
    minHeight: 52,
  },
  payMark: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summary: { borderRadius: 12, padding: 16, gap: 8 },
  summaryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  summaryDivider: { height: 1, marginVertical: 4 },
  modalRoot: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 32,
    maxHeight: '80%',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  addrRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
  },
  addNewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginTop: 8,
  },
  addrForm: { gap: 12, marginTop: 8 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successRoot: { flex: 1, justifyContent: 'flex-end' },
  successBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(28,27,27,0.5)' },
  successSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
  },
  successTop: { alignItems: 'center' },
  successIconOuter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(41,175,97,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  successIconInner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tracker: { borderRadius: 12, padding: 14, marginTop: 18, gap: 10 },
  trackerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  trackerDot: { width: 10, height: 10, borderRadius: 5 },
  progressTrack: { height: 6, borderRadius: 3, overflow: 'hidden', marginTop: 4 },
  progressFill: { height: '100%', borderRadius: 3 },
  homeLink: { alignItems: 'center', paddingTop: 14 },
});
