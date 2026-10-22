import { api } from './axios';
import type { ApiOk } from '../types';

export interface KitchenStatus {
  kitchenOpen: boolean;
}

/** Public oshxona holati — admin paneldan boshqariladi. */
export const settingsApi = {
  get: () => api.get<ApiOk<KitchenStatus>>('/settings').then((r) => r.data.data),
};
