import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, StyleSheet, Text, View } from 'react-native';
import { BIOMETRIC_KEY } from '../lib/constants';
import { useAuthStore } from '../store/auth.store';
import { useTheme } from '../theme/ThemeProvider';
import { Button } from './Button';
import { Icon } from './Icon';

/**
 * Biometrik qulf: Sozlamalarda yoqilgan bo'lsa, ilova ochilganda va fondan
 * qaytganda Face ID / barmoq izi bilan tasdiqlash so'raladi.
 */
export function BiometricGate({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const { colors } = theme;
  const [locked, setLocked] = useState(false);
  const [busy, setBusy] = useState(false);
  const autoTriedRef = useRef(false);
  // Biometrik dialog ochiq paytini kuzatish — AppState 'active'ga qaytganda
  // qayta-qulflash (cheksiz so'rov sikli) oldi olinadi.
  const busyRef = useRef(false);
  const lastUnlockAtRef = useRef(0);

  const tryUnlock = useCallback(async () => {
    setBusy(true);
    busyRef.current = true;
    try {
      const res = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Boyxon Oshxonasi',
        cancelLabel: 'Bekor qilish',
      });
      if (res.success) {
        lastUnlockAtRef.current = Date.now();
        setLocked(false);
      }
    } catch {
      /* jim */
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }, []);

  /** Qulfdan chiqib bo'lmasa — biometrikani o'chirib hisobdan chiqish yo'li. */
  const handleSignOut = useCallback(async () => {
    await AsyncStorage.removeItem(BIOMETRIC_KEY).catch(() => undefined);
    try {
      await useAuthStore.getState().logout();
    } catch {
      /* jim */
    }
    setLocked(false);
  }, []);

  // Ilova sovuq ochilganda tekshirish
  useEffect(() => {
    AsyncStorage.getItem(BIOMETRIC_KEY)
      .then((v) => {
        if (v === '1') setLocked(true);
      })
      .catch(() => undefined);
  }, []);

  // Fondan qaytganda qayta qulflash
  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => {
      if (s !== 'active') return;
      // Biometrik dialog yopilganda ilova yana 'active' bo'ladi — bu paytda
      // qayta qulflamaymiz, aks holda so'rov cheksiz takrorlanadi.
      if (busyRef.current || Date.now() - lastUnlockAtRef.current < 2000) return;
      AsyncStorage.getItem(BIOMETRIC_KEY)
        .then((v) => {
          if (v === '1') setLocked(true);
        })
        .catch(() => undefined);
    });
    return () => sub.remove();
  }, []);

  // Qulflanganda darhol biometrik so'rov yuboramiz (bir marta)
  useEffect(() => {
    if (locked && !autoTriedRef.current) {
      autoTriedRef.current = true;
      void tryUnlock();
    }
    if (!locked) autoTriedRef.current = false;
  }, [locked, tryUnlock]);

  return (
    <View style={styles.flex}>
      {children}
      {locked ? (
        <View style={[styles.overlay, { backgroundColor: colors.background }]}>
          <View style={[styles.logo, { backgroundColor: colors.primaryContainer }]}>
            <Icon name="restaurant" size={32} color={colors.onPrimary} />
          </View>
          <Text style={[theme.typography.headlineSm, { color: colors.onSurface, marginTop: 16 }]}>
            Boyxon Oshxonasi
          </Text>
          <Text
            style={[
              theme.typography.bodySm,
              { color: colors.onSurfaceVariant, marginTop: 4, textAlign: 'center' },
            ]}
          >
            Davom etish uchun biometrik tasdiqlash kerak
          </Text>
          <Button
            title="Tasdiqlash"
            size="md"
            full={false}
            loading={busy}
            onPress={tryUnlock}
            style={{ marginTop: 24, paddingHorizontal: 32, backgroundColor: colors.primaryContainer }}
          />
          <Text
            onPress={() => void handleSignOut()}
            style={[
              theme.typography.bodySm,
              { color: colors.onSurfaceVariant, marginTop: 16, textDecorationLine: 'underline' },
            ]}
          >
            Chiqish
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    zIndex: 9999,
    elevation: 9999,
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
