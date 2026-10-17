import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Constants from 'expo-constants';
import * as LocalAuthentication from 'expo-local-authentication';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useMemo, useRef, useState } from 'react';
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
import { authApi } from '../../api/auth.api';
import { apiErrorMessage } from '../../api/client';
import { ordersApi } from '../../api/orders.api';
import type { Address } from '../../api/types';
import { usersApi } from '../../api/users.api';
import { AppBar } from '../../components/AppBar';
import { Button } from '../../components/Button';
import { Icon } from '../../components/Icon';
import { Input } from '../../components/Input';
import i18n, { LANG_STORAGE_KEY, type AppLang } from '../../i18n';
import { BIOMETRIC_KEY, PAYMENT_KEY } from '../../lib/constants';
import { getInitials } from '../../lib/initials';
import { getRefreshToken } from '../../lib/tokenStorage';
import { useAuthStore } from '../../store/auth.store';
import { useToastStore } from '../../store/toast.store';
import { useTheme } from '../../theme/ThemeProvider';

type PaymentKey = 'payme' | 'click' | 'uzum' | 'cash';

const PAY_LABELS: Record<PaymentKey, string> = {
  payme: 'Payme',
  click: 'Click',
  uzum: 'Uzum Bank',
  cash: 'Naqd pul',
};

const LANG_LABELS: Record<AppLang, string> = {
  uz: "O'zbekcha",
  ru: 'Русский',
  en: 'English',
};

/** 12 500 ko'rinishida (mock'dagi kabi probel bilan). */
function fmtNum(n: number): string {
  return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      onPress={() => onChange(!value)}
      style={[
        styles.toggleTrack,
        { backgroundColor: value ? colors.primaryContainer : colors.surfaceContainerHighest },
      ]}
    >
      <View
        style={[
          styles.toggleThumb,
          {
            backgroundColor: colors.surfaceContainerLowest,
            alignSelf: value ? 'flex-end' : 'flex-start',
          },
        ]}
      />
    </Pressable>
  );
}

interface RowProps {
  icon: string;
  title: string;
  subtitle?: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
  right?: React.ReactNode;
}

/** Dizayn 04: bo'lim qatori — 36x36 ikonka, label-lg, chevron/qiymat. */
function SettingsRow({ icon, title, subtitle, value, onPress, danger, right }: RowProps) {
  const theme = useTheme();
  const { colors } = theme;
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.row,
        pressed && onPress ? { backgroundColor: colors.surfaceContainerLow } : null,
      ]}
    >
      <View style={styles.rowLeft}>
        <View
          style={[
            styles.rowIcon,
            { backgroundColor: danger ? 'rgba(255,218,214,0.4)' : colors.surfaceContainerLow },
          ]}
        >
          <Icon name={icon} size={20} color={danger ? colors.error : colors.primary} />
        </View>
        <View style={styles.rowText}>
          <Text
            numberOfLines={1}
            style={[
              theme.typography.labelLg,
              {
                color: danger ? colors.error : colors.onSurface,
                fontFamily: danger ? 'Inter_500Medium' : 'Inter_600SemiBold',
              },
            ]}
          >
            {title}
          </Text>
          {subtitle ? (
            <Text style={[theme.typography.bodySm, { color: colors.onSurfaceVariant, marginTop: 2 }]}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>
      {right !== undefined ? (
        right
      ) : (
        <View style={styles.rowRight}>
          {value ? (
            <Text
              numberOfLines={1}
              style={[
                theme.typography.bodySm,
                { color: colors.onSurfaceVariant, fontFamily: 'Inter_500Medium' },
              ]}
            >
              {value}
            </Text>
          ) : null}
          <Icon
            name="chevron_right"
            size={20}
            color={danger ? colors.error : colors.outline}
            style={danger ? { opacity: 0.6 } : undefined}
          />
        </View>
      )}
    </Pressable>
  );
}

function SectionLabel({ text }: { text: string }) {
  const theme = useTheme();
  return (
    <Text
      style={[
        theme.typography.labelSm,
        {
          color: theme.colors.onSurfaceVariant,
          textTransform: 'uppercase',
          letterSpacing: 1,
          paddingHorizontal: 4,
          fontFamily: 'Inter_600SemiBold',
        },
      ]}
    >
      {text}
    </Text>
  );
}

function Divider() {
  const { colors } = useTheme();
  return <View style={{ height: 1, backgroundColor: colors.surfaceContainerLow, marginHorizontal: 16 }} />;
}

function SheetHeader({ title, onClose }: { title: string; onClose: () => void }) {
  const theme = useTheme();
  return (
    <View style={styles.sheetHeader}>
      <Text style={[theme.typography.headlineSm, { color: theme.colors.onSurface }]}>{title}</Text>
      <Pressable hitSlop={8} onPress={onClose}>
        <Icon name="close" size={20} color={theme.colors.onSurfaceVariant} />
      </Pressable>
    </View>
  );
}

/** Dizayn 04: Sozlamalar. */
export default function SozlamalarScreen() {
  const theme = useTheme();
  const { colors, isDark } = theme;
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const showToast = useToastStore((s) => s.show);
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  const [pushEnabled, setPushEnabled] = useState(true);
  const [biometric, setBiometric] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentKey>('payme');
  const [savedFlash, setSavedFlash] = useState(false);
  const [saving, setSaving] = useState(false);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [profileOpen, setProfileOpen] = useState(false);
  const [addrOpen, setAddrOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  const [addrFormOpen, setAddrFormOpen] = useState(false);
  const [addrLabel, setAddrLabel] = useState('');
  const [addrText, setAddrText] = useState('');
  const [addrDefault, setAddrDefault] = useState(false);
  const [savingAddr, setSavingAddr] = useState(false);

  const ordersQ = useQuery({
    queryKey: ['my-orders', 1, 5],
    queryFn: () => ordersApi.myOrders(1, 5),
    enabled: !!user,
  });
  const ordersCount = ordersQ.data?.pagination.total ?? 0;

  useEffect(() => {
    if (user) setPushEnabled(user.notificationPrefs?.pushEnabled ?? true);
  }, [user]);

  useEffect(() => {
    AsyncStorage.getItem(BIOMETRIC_KEY)
      .then((v) => setBiometric(v === '1'))
      .catch(() => undefined);
    AsyncStorage.getItem(PAYMENT_KEY)
      .then((v) => {
        if (v === 'payme' || v === 'click' || v === 'uzum' || v === 'cash') setPaymentMethod(v);
      })
      .catch(() => undefined);
    return () => {
      if (savedTimer.current) clearTimeout(savedTimer.current);
    };
  }, []);

  const addresses: Address[] = useMemo(() => user?.addresses ?? [], [user]);
  const initials = getInitials(user?.name);
  const langLabel = LANG_LABELS[(i18n.language as AppLang) ?? 'uz'] ?? "O'zbekcha";

  const handleSave = async () => {
    setSaving(true);
    try {
      if (user) {
        await Promise.allSettled([
          usersApi.updatePrefs({ language: i18n.language as AppLang, theme: theme.mode }),
          usersApi.updateNotifPrefs({ pushEnabled }),
        ]);
      }
      setSavedFlash(true);
      if (savedTimer.current) clearTimeout(savedTimer.current);
      savedTimer.current = setTimeout(() => setSavedFlash(false), 1600);
    } catch (e) {
      showToast(apiErrorMessage(e, 'Saqlanmadi'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Hisobdan chiqish', 'Hisobingizdan chiqishni tasdiqlaysizmi?', [
      { text: 'Bekor qilish', style: 'cancel' },
      {
        text: 'Chiqish',
        style: 'destructive',
        onPress: async () => {
          try {
            const rt = await getRefreshToken();
            await authApi.logout(rt);
          } catch {
            /* server o'chiq bo'lsa ham lokal sessiyani tozalaymiz */
          }
          await useAuthStore.getState().logout();
          queryClient.clear();
          showToast('Hisobdan chiqdingiz');
        },
      },
    ]);
  };

  const onToggleBiometric = async (next: boolean) => {
    if (!next) {
      setBiometric(false);
      await AsyncStorage.removeItem(BIOMETRIC_KEY).catch(() => undefined);
      showToast("Biometrik kirish o'chirildi");
      return;
    }
    try {
      const hasHw = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (!hasHw || !enrolled) {
        showToast('Qurilmada biometrika sozlanmagan', 'error');
        return;
      }
      const res = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Biometrik kirishni yoqish',
      });
      if (!res.success) {
        showToast('Tasdiqlanmadi', 'error');
        return;
      }
      setBiometric(true);
      await AsyncStorage.setItem(BIOMETRIC_KEY, '1');
      showToast('Biometrik kirish yoqildi');
    } catch {
      showToast('Biometrika ishga tushmadi', 'error');
    }
  };

  const changeLang = async (lng: AppLang) => {
    await i18n.changeLanguage(lng);
    AsyncStorage.setItem(LANG_STORAGE_KEY, lng).catch(() => undefined);
    setLangOpen(false);
  };

  const openProfile = () => {
    setEditName(user?.name ?? '');
    setEditPhone(user?.phone ?? '');
    setProfileOpen(true);
  };

  const saveProfile = async () => {
    if (editName.trim().length < 2) {
      showToast('Ismingizni kiriting', 'error');
      return;
    }
    setSavingProfile(true);
    try {
      const res = await usersApi.updateMe({ name: editName.trim(), phone: editPhone.trim() || undefined });
      useAuthStore.getState().setUser(res.data);
      setProfileOpen(false);
      showToast('Saqlandi');
    } catch (e) {
      showToast(apiErrorMessage(e, 'Saqlanmadi'), 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const addAddress = async () => {
    if (addrText.trim().length < 5) {
      showToast("Manzilni to'liq kiriting", 'error');
      return;
    }
    setSavingAddr(true);
    try {
      await usersApi.addAddress({
        label: addrLabel.trim() || 'Manzil',
        address: addrText.trim(),
        isDefault: addrDefault,
      });
      const me = await authApi.me();
      useAuthStore.getState().setUser(me.data);
      setAddrFormOpen(false);
      setAddrLabel('');
      setAddrText('');
      setAddrDefault(false);
      showToast("Manzil qo'shildi");
    } catch (e) {
      showToast(apiErrorMessage(e, "Manzil qo'shilmadi"), 'error');
    } finally {
      setSavingAddr(false);
    }
  };

  const removeAddress = (a: Address) => {
    if (!a._id) return;
    Alert.alert("Manzilni o'chirish", a.address, [
      { text: 'Bekor qilish', style: 'cancel' },
      {
        text: "O'chirish",
        style: 'destructive',
        onPress: async () => {
          try {
            await usersApi.deleteAddress(a._id as string);
            const me = await authApi.me();
            useAuthStore.getState().setUser(me.data);
            showToast("Manzil o'chirildi");
          } catch (e) {
            showToast(apiErrorMessage(e), 'error');
          }
        },
      },
    ]);
  };

  const makeDefault = async (a: Address) => {
    if (!a._id || a.isDefault) return;
    try {
      await usersApi.updateAddress(a._id, { isDefault: true });
      const me = await authApi.me();
      useAuthStore.getState().setUser(me.data);
    } catch (e) {
      showToast(apiErrorMessage(e), 'error');
    }
  };

  const choosePayment = async (k: PaymentKey) => {
    setPaymentMethod(k);
    await AsyncStorage.setItem(PAYMENT_KEY, k).catch(() => undefined);
    setPayOpen(false);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar style="light" />
      <AppBar subtitle="Profil" showSearch={false} showBell={false} showAvatar={false} />

      <ScrollView
        style={styles.flex}
        contentContainerStyle={[styles.scroll, { paddingBottom: 32 + insets.bottom }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Sub-header: orqaga + sarlavha + Saqlash */}
        <View style={styles.subHeader}>
          <Pressable
            accessibilityLabel="Orqaga"
            onPress={() => router.navigate('/(tabs)')}
            style={({ pressed }) => [
              styles.backBtn,
              { backgroundColor: colors.surfaceContainerLow, opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <Icon name="arrow_back" size={20} color={colors.onSurface} />
          </Pressable>
          <Text style={[theme.typography.headlineSm, { color: colors.onSurface }]}>
            {t('settings.title', { defaultValue: 'Sozlamalar' })}
          </Text>
          <Pressable
            onPress={saving ? undefined : handleSave}
            style={({ pressed }) => [
              styles.saveBtn,
              {
                backgroundColor: savedFlash ? colors.tertiary : colors.primaryContainer,
                opacity: pressed ? 0.9 : 1,
              },
            ]}
          >
            <Icon name={savedFlash ? 'done_all' : 'check'} size={16} color={colors.onPrimary} />
            <Text style={[theme.typography.labelMd, { color: colors.onPrimary }]}>
              {savedFlash
                ? t('common.saved', { defaultValue: 'Saqlandi' })
                : t('common.save', { defaultValue: 'Saqlash' })}
            </Text>
          </Pressable>
        </View>

        {/* Profil kartasi (yoki kirish taklifi) */}
        {user ? (
          <View
            style={[
              styles.profileCard,
              { backgroundColor: colors.surfaceContainerLowest },
              theme.shadows.card,
            ]}
          >
            <View
              style={[
                styles.profileGlow,
                { backgroundColor: isDark ? colors.primaryFixed : 'rgba(255,220,197,0.3)' },
              ]}
            />
            <View style={styles.profileTop}>
              <View style={styles.avatarWrap}>
                <View style={[styles.avatar, { backgroundColor: colors.secondaryFixed }]}>
                  {user.avatar ? null : (
                    <Text
                      style={[
                        theme.typography.headlineMd,
                        { color: colors.onSecondaryFixed, fontFamily: 'Epilogue_700Bold' },
                      ]}
                    >
                      {initials}
                    </Text>
                  )}
                </View>
                <Pressable
                  onPress={openProfile}
                  style={({ pressed }) => [
                    styles.editBadge,
                    { backgroundColor: colors.primaryContainer, opacity: pressed ? 0.85 : 1 },
                  ]}
                >
                  <Icon name="edit" size={14} color={colors.onPrimary} />
                </Pressable>
              </View>
              <View style={styles.profileInfo}>
                <View style={styles.nameRow}>
                  <Text
                    numberOfLines={1}
                    style={[theme.typography.headlineSm, { color: colors.onSurface, flexShrink: 1 }]}
                  >
                    {user.name}
                  </Text>
                  {user.emailVerified ? (
                    <Icon name="verified" size={18} color={colors.primary} />
                  ) : null}
                </View>
                <Text
                  numberOfLines={1}
                  style={[theme.typography.bodySm, { color: colors.onSurfaceVariant, marginTop: 2 }]}
                >
                  {user.phone || '—'}
                </Text>
                <Text
                  numberOfLines={1}
                  style={[
                    theme.typography.bodySm,
                    { color: colors.onSurfaceVariant, opacity: 0.8 },
                  ]}
                >
                  {user.email}
                </Text>
              </View>
            </View>

            {/* Statistika */}
            <View style={styles.statsRow}>
              <Pressable
                onPress={() => router.push('/buyurtmalar')}
                style={[styles.statCell, { backgroundColor: colors.surfaceContainerLow }]}
              >
                <Text style={[theme.typography.labelLg, { color: colors.onSurface }]}>
                  {ordersCount}
                </Text>
                <Text
                  style={[
                    theme.typography.labelSm,
                    { color: colors.onSurfaceVariant, fontSize: 10, marginTop: 2 },
                  ]}
                >
                  {t('settings.statOrders', { defaultValue: 'Buyurtma' })}
                </Text>
              </Pressable>
              <View style={[styles.statCell, { backgroundColor: colors.surfaceContainerLow }]}>
                <Text style={[theme.typography.labelLg, { color: colors.onSurface }]}>
                  {user.favorites.length}
                </Text>
                <Text
                  style={[
                    theme.typography.labelSm,
                    { color: colors.onSurfaceVariant, fontSize: 10, marginTop: 2 },
                  ]}
                >
                  {t('settings.statFavorites', { defaultValue: 'Sevimli' })}
                </Text>
              </View>
              <View
                style={[
                  styles.statCell,
                  { backgroundColor: isDark ? colors.primaryFixed : 'rgba(255,220,197,0.4)' },
                ]}
              >
                <Text
                  style={[
                    theme.typography.labelLg,
                    { color: colors.primary, fontFamily: 'Inter_600SemiBold' },
                  ]}
                >
                  {fmtNum(user.bonusBalance)}
                </Text>
                <Text
                  style={[
                    theme.typography.labelSm,
                    { color: colors.onPrimaryFixedVariant, fontSize: 10, marginTop: 2 },
                  ]}
                >
                  {t('settings.statBonus', { defaultValue: "Bonus so'm" })}
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <View
            style={[
              styles.guestCard,
              { backgroundColor: colors.surfaceContainerLowest },
              theme.shadows.card,
            ]}
          >
            <View style={[styles.guestIcon, { backgroundColor: colors.primaryFixed }]}>
              <Icon name="person" size={22} color={colors.onPrimaryFixed} />
            </View>
            <View style={styles.flex}>
              <Text style={[theme.typography.labelLg, { color: colors.onSurface }]}>
                {t('settings.loginTitle', { defaultValue: 'Hisobingizga kiring' })}
              </Text>
              <Text style={[theme.typography.bodySm, { color: colors.onSurfaceVariant, marginTop: 2 }]}>
                {t('settings.loginText', {
                  defaultValue: "Buyurtmalar, manzillar va bonuslaringizni ko'rish uchun",
                })}
              </Text>
            </View>
            <Button
              title={t('auth.login', { defaultValue: 'Kirish' })}
              size="md"
              full={false}
              onPress={() => router.push('/kirish')}
              style={{ backgroundColor: colors.primaryContainer, paddingHorizontal: 20 }}
            />
          </View>
        )}

        {/* HISOB */}
        {user ? (
          <View style={styles.section}>
            <SectionLabel text={t('settings.account', { defaultValue: 'Hisob' })} />
            <View
              style={[
                styles.sectionCard,
                { backgroundColor: colors.surfaceContainerLowest },
                theme.shadows.card,
              ]}
            >
              <SettingsRow
                icon="person"
                title={t('settings.personal', { defaultValue: "Shaxsiy ma'lumotlar" })}
                onPress={openProfile}
              />
              <Divider />
              <SettingsRow
                icon="location_on"
                title={t('settings.addresses', { defaultValue: 'Manzillarim' })}
                value={`${addresses.length} ${t('settings.addressesCount', { defaultValue: 'ta manzil' })}`}
                onPress={() => setAddrOpen(true)}
              />
              <Divider />
              <SettingsRow
                icon="credit_card"
                title={t('settings.payments', { defaultValue: "To'lov usullari" })}
                value={PAY_LABELS[paymentMethod]}
                onPress={() => setPayOpen(true)}
              />
              {user.role === 'admin' ? (
                <>
                  <Divider />
                  <SettingsRow
                    icon="admin_panel_settings"
                    title={t('settings.admin', { defaultValue: 'Admin panel' })}
                    onPress={() => router.push('/admin')}
                  />
                </>
              ) : null}
            </View>
          </View>
        ) : null}

        {/* AFZALLIKLAR */}
        <View style={styles.section}>
          <SectionLabel text={t('settings.features', { defaultValue: 'Afzalliklar' })} />
          <View
            style={[
              styles.sectionCard,
              { backgroundColor: colors.surfaceContainerLowest },
              theme.shadows.card,
            ]}
          >
            <SettingsRow
              icon="notifications_active"
              title={t('settings.push', { defaultValue: 'Push bildirishnomalar' })}
              right={<Toggle value={pushEnabled} onChange={setPushEnabled} />}
            />
            <Divider />
            <SettingsRow
              icon="language"
              title={t('settings.language', { defaultValue: 'Ilova tili' })}
              value={langLabel}
              onPress={() => setLangOpen(true)}
            />
            <Divider />
            <SettingsRow
              icon="dark_mode"
              title={t('settings.darkMode', { defaultValue: 'Tungi rejim' })}
              right={<Toggle value={isDark} onChange={() => theme.toggle()} />}
            />
          </View>
        </View>

        {/* XAVFSIZLIK */}
        {user ? (
          <View style={styles.section}>
            <SectionLabel text={t('settings.security', { defaultValue: 'Xavfsizlik' })} />
            <View
              style={[
                styles.sectionCard,
                { backgroundColor: colors.surfaceContainerLowest },
                theme.shadows.card,
              ]}
            >
              <SettingsRow
                icon="fingerprint"
                title={t('settings.biometric', { defaultValue: 'Biometrik kirish' })}
                subtitle="Face ID / Touch ID"
                right={<Toggle value={biometric} onChange={onToggleBiometric} />}
              />
              <Divider />
              <SettingsRow
                icon="logout"
                title={t('settings.logout', { defaultValue: 'Hisobdan chiqish' })}
                danger
                onPress={handleLogout}
              />
            </View>
          </View>
        ) : null}

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerRow}>
            <Icon name="restaurant" size={16} color={colors.primary} style={{ opacity: 0.6 }} />
            <Text
              style={[
                theme.typography.labelSm,
                { color: colors.onSurfaceVariant, opacity: 0.6, fontFamily: 'Inter_500Medium' },
              ]}
            >
              Boyxon Oshxonasi
            </Text>
          </View>
          <Text
            style={[
              theme.typography.bodySm,
              { color: colors.onSurfaceVariant, opacity: 0.7, fontSize: 11 },
            ]}
          >
            v{Constants.expoConfig?.version ?? '1.0.0'}
          </Text>
        </View>
      </ScrollView>

      {/* Shaxsiy ma'lumotlar modali */}
      <Modal visible={profileOpen} transparent animationType="slide" onRequestClose={() => setProfileOpen(false)}>
        <KeyboardAvoidingView
          style={styles.modalRoot}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Pressable style={styles.backdrop} onPress={() => setProfileOpen(false)} />
          <View style={[styles.sheet, { backgroundColor: colors.surfaceContainerLowest }]}>
            <SheetHeader
              title={t('settings.personal', { defaultValue: "Shaxsiy ma'lumotlar" })}
              onClose={() => setProfileOpen(false)}
            />
            <View style={styles.formGap}>
              <Input
                label={t('auth.name', { defaultValue: 'Ism' })}
                icon="person"
                value={editName}
                onChangeText={setEditName}
                placeholder="Ism va familiya"
                autoCapitalize="words"
              />
              <Input
                label={t('auth.phone', { defaultValue: 'Telefon' })}
                icon="phone"
                value={editPhone}
                onChangeText={setEditPhone}
                placeholder="+998 90 123 45 67"
                keyboardType="phone-pad"
              />
              <Button
                title={t('common.save', { defaultValue: 'Saqlash' })}
                size="md"
                loading={savingProfile}
                onPress={saveProfile}
                style={{ backgroundColor: colors.primaryContainer }}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Manzillar modali */}
      <Modal visible={addrOpen} transparent animationType="slide" onRequestClose={() => setAddrOpen(false)}>
        <KeyboardAvoidingView
          style={styles.modalRoot}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Pressable style={styles.backdrop} onPress={() => setAddrOpen(false)} />
          <View style={[styles.sheet, { backgroundColor: colors.surfaceContainerLowest }]}>
            <SheetHeader
              title={t('settings.addresses', { defaultValue: 'Manzillarim' })}
              onClose={() => setAddrOpen(false)}
            />
            <ScrollView keyboardShouldPersistTaps="handled" style={styles.sheetScroll}>
              {addresses.map((a) => (
                <View key={a._id ?? a.address} style={styles.addrRow}>
                  <Pressable style={styles.addrMain} onPress={() => makeDefault(a)}>
                    <Icon
                      name={a.isDefault ? 'radio_button_checked' : 'radio_button_unchecked'}
                      size={22}
                      color={a.isDefault ? colors.primary : colors.outline}
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
                  <Pressable hitSlop={8} onPress={() => removeAddress(a)}>
                    <Icon name="delete_outline" size={20} color={colors.error} style={{ opacity: 0.7 }} />
                  </Pressable>
                </View>
              ))}

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
                <View style={styles.formGap}>
                  <Input
                    label={t('cart.addressLabel', { defaultValue: 'Nomi' })}
                    icon="bookmark"
                    value={addrLabel}
                    onChangeText={setAddrLabel}
                    placeholder="Uy / Ish"
                    autoCapitalize="words"
                  />
                  <Input
                    label={t('cart.addressText', { defaultValue: 'Manzil' })}
                    icon="location_on"
                    value={addrText}
                    onChangeText={setAddrText}
                    placeholder="Chilonzor, 19-kvartal, 12-uy"
                  />
                  <Pressable style={styles.checkRow} onPress={() => setAddrDefault((v) => !v)}>
                    <View
                      style={[
                        styles.checkbox,
                        {
                          borderColor: addrDefault ? colors.primaryContainer : colors.outline,
                          backgroundColor: addrDefault ? colors.primaryContainer : 'transparent',
                        },
                      ]}
                    >
                      {addrDefault ? <Icon name="check" size={12} color={colors.onPrimary} /> : null}
                    </View>
                    <Text style={[theme.typography.labelSm, { color: colors.onSurfaceVariant }]}>
                      {t('cart.setDefault', { defaultValue: 'Asosiy manzil qilish' })}
                    </Text>
                  </Pressable>
                  <Button
                    title={t('common.save', { defaultValue: 'Saqlash' })}
                    size="md"
                    loading={savingAddr}
                    onPress={addAddress}
                    style={{ backgroundColor: colors.primaryContainer }}
                  />
                </View>
              )}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* To'lov usuli modali */}
      <Modal visible={payOpen} transparent animationType="slide" onRequestClose={() => setPayOpen(false)}>
        <View style={styles.modalRoot}>
          <Pressable style={styles.backdrop} onPress={() => setPayOpen(false)} />
          <View style={[styles.sheet, { backgroundColor: colors.surfaceContainerLowest }]}>
            <SheetHeader
              title={t('settings.payments', { defaultValue: "To'lov usullari" })}
              onClose={() => setPayOpen(false)}
            />
            {(Object.keys(PAY_LABELS) as PaymentKey[]).map((k) => (
              <Pressable key={k} style={styles.payRow} onPress={() => choosePayment(k)}>
                <Icon
                  name={paymentMethod === k ? 'radio_button_checked' : 'radio_button_unchecked'}
                  size={22}
                  color={paymentMethod === k ? colors.primary : colors.outline}
                />
                <Text style={[theme.typography.labelLg, { color: colors.onSurface }]}>
                  {PAY_LABELS[k]}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </Modal>

      {/* Til modali */}
      <Modal visible={langOpen} transparent animationType="slide" onRequestClose={() => setLangOpen(false)}>
        <View style={styles.modalRoot}>
          <Pressable style={styles.backdrop} onPress={() => setLangOpen(false)} />
          <View style={[styles.sheet, { backgroundColor: colors.surfaceContainerLowest }]}>
            <SheetHeader
              title={t('settings.language', { defaultValue: 'Ilova tili' })}
              onClose={() => setLangOpen(false)}
            />
            {(Object.keys(LANG_LABELS) as AppLang[]).map((k) => (
              <Pressable key={k} style={styles.payRow} onPress={() => changeLang(k)}>
                <Icon
                  name={i18n.language === k ? 'radio_button_checked' : 'radio_button_unchecked'}
                  size={22}
                  color={i18n.language === k ? colors.primary : colors.outline}
                />
                <Text style={[theme.typography.labelLg, { color: colors.onSurface }]}>
                  {LANG_LABELS[k]}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingTop: 12, gap: 16 },
  subHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: {
    width: 40,
    height: 40,
    marginLeft: -4,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 9999,
  },
  profileCard: {
    borderRadius: 12,
    padding: 16,
    overflow: 'hidden',
  },
  profileGlow: {
    position: 'absolute',
    right: -24,
    bottom: -24,
    width: 112,
    height: 112,
    borderRadius: 56,
  },
  profileTop: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatarWrap: { position: 'relative' },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: { flex: 1, minWidth: 0 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statsRow: { flexDirection: 'row', gap: 8, paddingTop: 12 },
  statCell: {
    flex: 1,
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestCard: {
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  guestIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: { gap: 8 },
  sectionCard: { borderRadius: 12, overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    gap: 12,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 16, flex: 1, minWidth: 0 },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: { flex: 1, minWidth: 0 },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1 },
  toggleTrack: {
    width: 48,
    height: 28,
    borderRadius: 14,
    padding: 2,
    justifyContent: 'center',
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  footer: { alignItems: 'center', gap: 4, paddingTop: 8, paddingBottom: 8 },
  footerRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  modalRoot: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.45)' },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 32,
    maxHeight: '85%',
  },
  sheetScroll: { marginTop: 4 },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  formGap: { gap: 12, marginTop: 4 },
  addrRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  addrMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, minWidth: 0 },
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
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
  },
});
