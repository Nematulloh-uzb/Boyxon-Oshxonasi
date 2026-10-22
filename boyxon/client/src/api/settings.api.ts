import { api } from './axios';
import type { ApiOk } from '../types';

export interface PublicSettings {
  kitchenOpen: boolean;
  /** Karta o'tkazmasi uchun rekvizitlar. Bo'sh bo'lsa, karta usuli ko'rsatilmaydi. */
  cardNumber: string;
  cardHolder: string;
}

export type KitchenStatus = PublicSettings;

/** Public sozlamalar — oshxona holati va karta rekvizitlari. */
export const settingsApi = {
  get: () => api.get<ApiOk<PublicSettings>>('/settings').then((r) => r.data.data),
};
