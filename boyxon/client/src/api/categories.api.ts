import { api } from './axios';
import type { ApiOk, Category } from '../types';

export const categoriesApi = {
  list: () => api.get<ApiOk<Category[]>>('/categories').then((r) => r.data),
  detail: (slug: string) =>
    api.get<ApiOk<Category>>(`/categories/${encodeURIComponent(slug)}`).then((r) => r.data),
};
