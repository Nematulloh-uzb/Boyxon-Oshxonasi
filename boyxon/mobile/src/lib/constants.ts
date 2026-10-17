/**
 * Server (order.controller.ts) bilan AYNAN bir xil hisob-kitob qoidalari.
 * Narxlar ikki tomonda bir xil chiqishi uchun shu yerdan foydalaniladi.
 */

export const DELIVERY_FEE = 12000;
export const FREE_DELIVERY_FROM = 150000;

export function calcDeliveryFee(subtotal: number, deliveryType: 'delivery' | 'pickup'): number {
  if (deliveryType === 'pickup') return 0;
  return subtotal >= FREE_DELIVERY_FROM ? 0 : DELIVERY_FEE;
}

export const PUSH_PROMPT_KEY = 'boyxon.push-prompt-dismissed';

/** Biometrik qulf yoqilgani (AsyncStorage flag) */
export const BIOMETRIC_KEY = 'boyxon-biometric';

/** Oxirgi tanlangan to'lov usuli (AsyncStorage) */
export const PAYMENT_KEY = 'boyxon-payment';

/** Aksiya banneri uchun standart promo kod (server'dagi faol kod). */
export const DEFAULT_PROMO_CODE = 'BOYXON20';

/**
 * Sayt manzili — mobil ilovada web sahifalar (masalan, admin panel)
 * brauzerda ochiladi. Production: boyxon-frontend.onrender.com.
 */
export const SITE_URL =
  (process.env.EXPO_PUBLIC_SITE_URL as string | undefined)?.replace(/\/+$/, '') ??
  'https://boyxon-frontend.onrender.com';
