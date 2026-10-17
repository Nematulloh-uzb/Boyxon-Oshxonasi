import * as SecureStore from 'expo-secure-store';

/**
 * Refresh token (uzoq muddatli) va access token SecureStore'da saqlanadi.
 * Web'dagi httpOnly cookie'ning mobil ekvivalenti — ilova o'chirilsa ham
 * sessiya saqlanib qoladi.
 *
 * "Eslab qolish" belgilanmasa (persist=false) — refresh token faqat xotirada
 * turadi: ilova qayta ochilganda qaytadan kirish talab qilinadi.
 */
const REFRESH_KEY = 'boyxon.refreshToken';
const ACCESS_KEY = 'boyxon.accessToken';

let persistRefresh = true;
let memoryRefresh: string | null = null;

export async function getRefreshToken(): Promise<string | null> {
  if (memoryRefresh) return memoryRefresh;
  try {
    return await SecureStore.getItemAsync(REFRESH_KEY);
  } catch {
    return null;
  }
}

export async function setRefreshToken(token: string | null, persist?: boolean): Promise<void> {
  if (persist !== undefined) persistRefresh = persist;
  memoryRefresh = token;
  try {
    if (!token) {
      await SecureStore.deleteItemAsync(REFRESH_KEY);
      return;
    }
    if (persistRefresh) await SecureStore.setItemAsync(REFRESH_KEY, token);
  } catch {
    /* jim */
  }
}

export async function getStoredAccessToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(ACCESS_KEY);
  } catch {
    return null;
  }
}

export async function setStoredAccessToken(token: string | null): Promise<void> {
  try {
    if (token) await SecureStore.setItemAsync(ACCESS_KEY, token);
    else await SecureStore.deleteItemAsync(ACCESS_KEY);
  } catch {
    /* jim */
  }
}

export async function clearTokenStorage(): Promise<void> {
  await setRefreshToken(null);
  await setStoredAccessToken(null);
}
