import {
  Epilogue_600SemiBold,
  Epilogue_700Bold,
} from '@expo-google-fonts/epilogue';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { authApi } from '../api/auth.api';
import { refreshSession } from '../api/client';
import { ToastHost } from '../components/ToastHost';
import { loadSavedLanguage } from '../i18n';
import { getRefreshToken, getStoredAccessToken } from '../lib/tokenStorage';
import { useAuthStore } from '../store/auth.store';
import { ThemeProvider, useTheme } from '../theme/ThemeProvider';

// Splash'ni qo'lda yashiramiz (shrift + sessiya tayyor bo'lgach).
SplashScreen.preventAutoHideAsync().catch(() => undefined);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000, refetchOnWindowFocus: false },
  },
});

/**
 * Ilova ochilganda sessiyani tiklash:
 * 1) SecureStore'dagi access token bo'lsa — darhol o'rnatamiz;
 * 2) faqat refresh token bo'lsa — yangilaymiz;
 * 3) keyin fonda /auth/me bilan tekshiramiz (401 bo'lsa interceptor o'zi yangilaydi).
 */
async function bootstrapSession(): Promise<void> {
  const store = useAuthStore.getState();
  try {
    const [storedAccess, refresh] = await Promise.all([getStoredAccessToken(), getRefreshToken()]);
    if (storedAccess) store.setToken(storedAccess);
    if (!storedAccess && refresh) {
      try {
        await refreshSession();
      } catch {
        /* sessiya yo'q — mehmon sifatida davom etamiz */
      }
    }
  } catch {
    /* jim */
  }
  store.setSessionReady(true);
  if (useAuthStore.getState().accessToken) {
    authApi
      .me()
      .then((r) => useAuthStore.getState().setUser(r.data))
      .catch(() => undefined);
  }
}

function RootStack() {
  const theme = useTheme();
  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.background },
        }}
      />
      <ToastHost />
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Epilogue_600SemiBold,
    Epilogue_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    void (async () => {
      await Promise.allSettled([loadSavedLanguage(), bootstrapSession()]);
      setBooted(true);
    })();
  }, []);

  useEffect(() => {
    if (fontsLoaded && booted) {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [fontsLoaded, booted]);

  if (!fontsLoaded || !booted) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <RootStack />
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
