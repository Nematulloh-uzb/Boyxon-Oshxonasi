import { useQuery } from '@tanstack/react-query';
import { settingsApi } from '../api/settings.api';

/**
 * Oshxona ochiq/yopiq holati — bitta umumiy query.
 * Header, banner va checkout bir xil cache'ni ishlatadi; server esa
 * buyurtma yaratishda holatni yana bir bor tekshiradi.
 */
export function useKitchenStatus() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: settingsApi.get,
    staleTime: 30_000,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });
}
