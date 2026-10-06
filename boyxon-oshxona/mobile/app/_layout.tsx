import 'react-native-gesture-handler';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

// Root layout — QueryClient + i18n + auth yuklash
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '../global.css';
import '../src/i18n';
import { useAuth } from '../src/store/auth.store';

export default function RootLayout() {
  const [mijoz] = useState(() => new QueryClient());
  const yuklash = useAuth((h) => h.yuklash);

  useEffect(() => {
    void yuklash();
  }, [yuklash]);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={mijoz}>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="category/[id]" />
          <Stack.Screen name="product/[id]" />
          <Stack.Screen name="orders" />
        </Stack>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
