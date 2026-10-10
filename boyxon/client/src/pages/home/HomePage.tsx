import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { dishesApi, type DishFilters } from '../../api/dishes.api';
import { categoriesApi } from '../../api/categories.api';
import { CategoryChips } from '../../components/dish/CategoryChips';
import { DishGrid } from '../../components/dish/DishGrid';
import { DishCard } from '../../components/dish/DishCard';
import { DishFilterSheet, type DishFilterValues } from '../../components/dish/DishFilterSheet';
import { useDebounce } from '../../hooks/useDebounce';
import { QUERY_KEYS } from '../../lib/constants';

export default function HomePage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string | undefined>();
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<DishFilterValues>({});
  const [page, setPage] = useState(1);
  const debounced = useDebounce(search, 400);

  const { data: cats, isLoading: catsLoading } = useQuery({
    queryKey: [QUERY_KEYS.categories],
    queryFn: () => categoriesApi.list().then((r) => r.data),
    staleTime: 10 * 60 * 1000,
  });

  const params: DishFilters = useMemo(
    () => ({
      category,
      search: debounced || undefined,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      rating: filters.rating,
      tags: filters.tags,
      sort: filters.sort,
      page,
      limit: 12,
    }),
    [category, debounced, filters, page],
  );

  const { data, isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: [QUERY_KEYS.dishes, params],
    queryFn: () => dishesApi.list(params),
  });

  const { data: featured, isLoading: featLoading } = useQuery({
    queryKey: [QUERY_KEYS.featured],
    queryFn: () => dishesApi.featured().then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });

  const setCat = (slug?: string): void => {
    setCategory(slug);
    setPage(1);
  };
  const applyFilters = (v: DishFilterValues): void => {
    setFilters(v);
    setPage(1);
  };
