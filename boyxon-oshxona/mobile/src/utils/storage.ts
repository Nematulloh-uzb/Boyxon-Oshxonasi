import * as SecureStore from 'expo-secure-store';

// Xavfsiz saqlash — XATO 12: token faqat shu yerda (AsyncStorage YO'Q)
const KALITLAR = {
  token: 'boyxon-access-token',
  refresh: 'boyxon-refresh-token',
} as const;

export async function tokenSaqlash(token: string, refresh: string): Promise<void> {
  await SecureStore.setItemAsync(KALITLAR.token, token);
  await SecureStore.setItemAsync(KALITLAR.refresh, refresh);
}

export async function tokenOlish(): Promise<string | null> {
  return SecureStore.getItemAsync(KALITLAR.token);
}

export async function refreshOlish(): Promise<string | null> {
  return SecureStore.getItemAsync(KALITLAR.refresh);
}

export async function tokenOchirish(): Promise<void> {
  await SecureStore.deleteItemAsync(KALITLAR.token);
  await SecureStore.deleteItemAsync(KALITLAR.refresh);
}
