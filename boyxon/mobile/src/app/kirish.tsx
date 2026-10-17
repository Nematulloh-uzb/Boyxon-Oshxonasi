import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as WebBrowser from 'expo-web-browser';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, Path, Pattern, Rect } from 'react-native-svg';
import { authApi } from '../api/auth.api';
import { apiErrorMessage } from '../api/client';
import { Button } from '../components/Button';
import { GoogleG } from '../components/GoogleG';
import { Icon } from '../components/Icon';
import { Input } from '../components/Input';
import { SegmentedControl } from '../components/SegmentedControl';
import { setRefreshToken } from '../lib/tokenStorage';
import { useAuthStore } from '../store/auth.store';
import { useToastStore } from '../store/toast.store';
import { useTheme } from '../theme/ThemeProvider';

type Mode = 'login' | 'register' | 'forgot';

const EMAIL_RE = /^\S+@\S+\.\S+$/;

/** Hero fonidagi o'zbek naqshi (8% oq, 24px katak). */
function HeroPattern() {
  return (
    <Svg width="100%" height="100%" style={StyleSheet.absoluteFill} pointerEvents="none">
      <Defs>
        <Pattern id="uzor" x="0" y="0" width={24} height={24} patternUnits="userSpaceOnUse">
          <Path d="M12 3 L21 12 L12 21 L3 12 Z" stroke="white" strokeWidth={1} fill="none" />
          <Circle cx={12} cy={12} r={1.6} fill="white" />
          <Path d="M0 0 L5 5 M24 0 L19 5 M0 24 L5 19 M24 24 L19 19" stroke="white" strokeWidth={1} />
        </Pattern>
      </Defs>
      <Rect x="0" y="0" width="100%" height="100%" fill="url(#uzor)" opacity={0.08} />
    </Svg>
  );
}

/** Dizayn 01: Kirish va Ro'yxatdan o'tish (hero + sheet). */
export default function KirishScreen() {
  const theme = useTheme();
  const { colors } = theme;
  const router = useRouter();
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();
  const showToast = useToastStore((s) => s.show);

  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const title = useMemo(() => {
    if (mode === 'forgot') return 'Parolni tiklash';
    return 'Xush kelibsiz! 👋';
  }, [mode]);

  const subtitle = useMemo(() => {
    if (mode === 'login') return 'Hisobingizga kiring';
    if (mode === 'register') return 'Yangi hisob yarating';
    return 'Emailingizni kiriting — tiklash havolasini yuboramiz';
  }, [mode]);

  const goHome = () => {
    if (returnTo) router.replace(returnTo as never);
    else router.replace('/(tabs)');
  };

  const validate = (fields: Mode): boolean => {
    const next: Record<string, string> = {};
    if (fields === 'register' && name.trim().length < 2) next.name = 'Ismingizni kiriting';
    if (!EMAIL_RE.test(email)) next.email = 'Email formati noto‘g‘ri';
    if (fields !== 'forgot' && password.length < 6) next.password = 'Parol kamida 6 belgidan iborat';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleLogin = async () => {
    if (!validate('login')) return;
    setLoading(true);
    try {
      const res = await authApi.login({ email: email.trim(), password });
      await useAuthStore.getState().applySession(res.data, { persistRefresh: remember });
      if (!remember) await setRefreshToken(null, false);
      showToast("Xush kelibsiz!", 'success');
      goHome();
    } catch (e) {
      showToast(apiErrorMessage(e, 'Kirish amalga oshmadi'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!validate('register')) return;
    setLoading(true);
    try {
      const res = await authApi.register({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        password,
      });
      const payload = res.data;
      if (payload.accessToken) {
        await useAuthStore.getState().applySession(payload, { persistRefresh: remember });
        showToast("Ro'yxatdan o'tdingiz!", 'success');
        goHome();
      } else {
        showToast(
          payload.emailDelivered
            ? 'Emailingizga tasdiqlash havolasi yuborildi'
            : "Email yuborilmadi — keyinroq qayta urinib ko'ring",
          'info',
        );
        setMode('login');
      }
    } catch (e) {
      showToast(apiErrorMessage(e, "Ro'yxatdan o'tish amalga oshmadi"), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async () => {
    if (!validate('forgot')) return;
    setLoading(true);
    try {
      const res = await authApi.forgotPassword(email.trim());
      showToast(res.message || 'Havola yuborildi', 'success');
      setMode('login');
    } catch (e) {
      showToast(apiErrorMessage(e), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      setLoading(true);
      const result = await WebBrowser.openAuthSessionAsync(authApi.googleUrl(), 'boyxon://auth');
      if (result.type !== 'success' || !result.url) return;
      const url = new URL(result.url);
      const code = url.searchParams.get('code');
      const error = url.searchParams.get('error');
      if (error) {
        showToast(error === 'google_not_configured' ? 'Google hozircha sozlanmagan' : error, 'error');
        return;
      }
      if (!code) return;
      const res = await authApi.googleExchange(code);
      await useAuthStore.getState().applySession(res.data);
      showToast('Kirdingiz!', 'success');
      goHome();
    } catch (e) {
      showToast(apiErrorMessage(e, 'Google orqali kirish amalga oshmadi'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const isLogin = mode === 'login';
  const isRegister = mode === 'register';
  const isForgot = mode === 'forgot';

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Hero */}
          <LinearGradient
            colors={['#e67e22', '#d35400']}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.hero}
          >
            <HeroPattern />
            <SafeAreaView edges={['top']} style={styles.heroInner}>
              <View style={styles.badgeOuter}>
                <View style={styles.badgeInner}>
                  <Icon name="soup_kitchen" size={36} color="#a23f00" />
                </View>
              </View>
              <Text style={[theme.typography.headlineLgMobile, styles.brand]}>Boyxon Oshxonasi</Text>
              <Text style={styles.tagline}>Uy ta'mi, har bir luqmada</Text>
            </SafeAreaView>
          </LinearGradient>

          {/* Sheet */}
          <View
            style={[
              styles.sheet,
              { backgroundColor: colors.surfaceContainerLowest },
              theme.shadows.modal,
            ]}
          >
            {!isForgot ? (
              <SegmentedControl
                items={[
                  { key: 'login', label: 'Kirish' },
                  { key: 'register', label: "Ro'yxatdan o'tish" },
                ]}
                value={mode}
                onChange={(k) => {
                  setMode(k as Mode);
                  setErrors({});
                }}
              />
            ) : null}

            <View style={styles.greeting}>
              <Text style={[theme.typography.headlineSm, { color: colors.onSurface }]}>{title}</Text>
              <Text style={[theme.typography.bodySm, { color: colors.onSurfaceVariant, marginTop: 2 }]}>
                {subtitle}
              </Text>
            </View>

            <View style={styles.form}>
              {isRegister ? (
                <Input
                  label="Ism"
                  icon="person"
                  value={name}
                  onChangeText={setName}
                  placeholder="Ism va familiya"
                  autoCapitalize="words"
                  error={errors.name}
                />
              ) : null}

              <Input
                label="Email"
                icon="mail"
                value={email}
                onChangeText={setEmail}
                placeholder="email@misol.uz"
                keyboardType="email-address"
                error={errors.email}
              />

              {isRegister ? (
                <Input
                  label="Telefon (ixtiyoriy)"
                  icon="phone"
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="+998 90 123 45 67"
                  keyboardType="phone-pad"
                />
              ) : null}

              {!isForgot ? (
                <Input
                  label="Parol"
                  icon="lock"
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  secureTextEntry={!showPassword}
                  error={errors.password}
                  returnKeyType="done"
                  onSubmitEditing={isLogin ? handleLogin : handleRegister}
                  rightElement={
                    <Pressable hitSlop={8} onPress={() => setShowPassword((v) => !v)}>
                      <Icon
                        name={showPassword ? 'visibility_off' : 'visibility'}
                        size={20}
                        color={colors.outline}
                      />
                    </Pressable>
                  }
                />
              ) : null}

              {isLogin ? (
                <View style={styles.rowBetween}>
                  <Pressable style={styles.rememberRow} onPress={() => setRemember((v) => !v)}>
                    <View
                      style={[
                        styles.checkbox,
                        {
                          borderColor: remember ? colors.primaryContainer : colors.outline,
                          backgroundColor: remember ? colors.primaryContainer : 'transparent',
                        },
                      ]}
                    >
                      {remember ? <Icon name="check" size={12} color={colors.onPrimary} /> : null}
                    </View>
                    <Text style={[theme.typography.labelSm, { color: colors.onSurfaceVariant }]}>
                      Eslab qolish
                    </Text>
                  </Pressable>
                  <Pressable hitSlop={8} onPress={() => setMode('forgot')}>
                    <Text style={[theme.typography.labelSm, { color: colors.primary }]}>
                      Parolni unutdingizmi?
                    </Text>
                  </Pressable>
                </View>
              ) : null}

              <Button
                title={isLogin ? 'Kirish' : isRegister ? "Ro'yxatdan o'tish" : 'Havola yuborish'}
                variant="gradient"
                size="lg"
                iconRight={isForgot ? undefined : 'arrow-forward'}
                loading={loading}
                onPress={isLogin ? handleLogin : isRegister ? handleRegister : handleForgot}
                style={{ marginTop: 4 }}
              />

              {!isForgot ? (
                <>
                  <View style={styles.dividerRow}>
                    <View style={[styles.line, { backgroundColor: colors.outlineVariant }]} />
                    <Text
                      style={[
                        theme.typography.labelSm,
                        { color: colors.outline, letterSpacing: 1, paddingHorizontal: 8 },
                      ]}
                    >
                      YOKI
                    </Text>
                    <View style={[styles.line, { backgroundColor: colors.outlineVariant }]} />
                  </View>

                  <Pressable
                    onPress={handleGoogle}
                    disabled={loading}
                    style={({ pressed }) => [
                      styles.googleBtn,
                      {
                        backgroundColor: colors.surfaceContainerLow,
                        opacity: pressed ? 0.85 : 1,
                      },
                    ]}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color={colors.primary} />
                    ) : (
                      <>
                        <GoogleG size={20} />
                        <Text style={[theme.typography.labelLg, { color: colors.onSurface }]}>
                          Google orqali kirish
                        </Text>
                      </>
                    )}
                  </Pressable>
                </>
              ) : null}

              <View style={styles.footer}>
                {isForgot ? (
                  <Pressable hitSlop={8} onPress={() => setMode('login')}>
                    <Text style={[theme.typography.labelLg, { color: colors.primary }]}>
                      Kirishga qaytish
                    </Text>
                  </Pressable>
                ) : (
                  <>
                    <Text style={[theme.typography.bodyMd, { color: colors.onSurfaceVariant }]}>
                      {isLogin ? "Hisobingiz yo'qmi? " : 'Hisobingiz bormi? '}
                    </Text>
                    <Pressable
                      hitSlop={8}
                      onPress={() => {
                        setMode(isLogin ? 'register' : 'login');
                        setErrors({});
                      }}
                    >
                      <Text style={[theme.typography.labelLg, { color: colors.primary }]}>
                        {isLogin ? "Ro'yxatdan o'ting" : 'Kirish'}
                      </Text>
                    </Pressable>
                  </>
                )}
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  scroll: { flexGrow: 1 },
  hero: {
    paddingBottom: 64,
  },
  heroInner: {
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 24,
  },
  badgeOuter: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 8,
  },
  badgeInner: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#ffdcc5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    color: '#ffffff',
    marginTop: 16,
    letterSpacing: -0.24,
  },
  tagline: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Inter_400Regular',
    marginTop: 4,
  },
  sheet: {
    marginTop: -32,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 16,
    paddingTop: 28,
    paddingBottom: 40,
    flex: 1,
  },
  greeting: { marginTop: 20, marginBottom: 16 },
  form: { gap: 12 },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: -4,
  },
  rememberRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  line: { flex: 1, height: 1 },
  googleBtn: {
    height: 48,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    flexWrap: 'wrap',
  },
});
