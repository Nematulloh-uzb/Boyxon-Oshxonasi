import { api } from './axios';
import type { ApiOk } from '../types';

export const promosApi = {
  validate: (code: string, subtotal: number) =>
    api.post<ApiOk<{ code: string; discount: number; description?: string }>>('/promos/validate', { code, subtotal }).then((r) => r.data),
};
