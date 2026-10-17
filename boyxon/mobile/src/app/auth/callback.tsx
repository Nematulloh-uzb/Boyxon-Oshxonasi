import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { completeGoogleLogin } from '../../lib/googleLogin';
import { useToastStore } from '../../store/toast.store';
import { useTheme } from '../../theme/ThemeProvider';

/**
 * Google OAuth'dan qaytish sahifasi (web'dagi AuthCallback'ning mobil analogi).
 *
 * Server native oqimda shu manzilga qaytaradi:
 *   boyxon://auth/callback?code=...   (yoki ?error=...)
 * expo-router bu deep-linkni /auth/callback yo'liga ulaydi.
 */
export default function GoogleCallbackScreen() {
  const theme = useTheme();
  const router = useRouter();
  const showToast = useToastStore((s) => s.show);
  const params = useLocalSearchParams<{ code?: string; error?: string }>();
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return; // dev rejimida effekt ikki marta ishlamasin
    started.current = true;

    const run = async () => {
      const code = typeof params.code === 'string' ? params.code : undefined;
      const error = typeof params.error === 'string' ? params.error : undefined;

      if (error) {
        showToast(error === 'google_not_configured' ? 'Google hozircha sozlanmagan' : error, 'error');
        router.replace('/kirish');
        return;
      }
      if (!code) {
        router.replace('/kirish');
        return;
      }
      const ok = await completeGoogleLogin(code);
      router.replace(ok ? '/(tabs)' : '/kirish');
    };

    void run();
    // Parametrlar FAQAT birinchi renderda kerak — qasddan bo'sh deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <StatusBar style="light" />
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text style={[styles.text, { color: theme.colors.onSurfaceVariant }]}>
        Google orqali kirilmoqda…
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  text: {
    fontSize: 14,
  },
});
