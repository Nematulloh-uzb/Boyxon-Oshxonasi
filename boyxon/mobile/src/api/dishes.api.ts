import { api } from './client';
import type { ApiOk, Category, Dish, Paginated } from './types';

export interface DishFilters {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  tags?: string;
  sort?: string;
  page?: number;
  limit?: number;
}

export const dishesApi = {
  list: (f: DishFilters = {}) =>
    api.get<Paginated<Dish>>('/dishes', { params: f }).then((r) => r.data),
  featured: () => api.get<ApiOk<Dish[]>>('/dishes/featured').then((r) => r.data),
  detail: (slug: string) =>
    api.get<ApiOk<{ dish: Dish; reviews: unknown[] }>>(`/dishes/${slug}`).then((r) => r.data),
};

export const categoriesApi = {
  list: () => api.get<ApiOk<Category[]>>('/categories').then((r) => r.data),
};
