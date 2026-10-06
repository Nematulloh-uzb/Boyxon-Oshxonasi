import { useQuery } from '@tanstack/react-query';
import { kategoriyaOlish, mahsulotOlish } from '../api/products.api';

// Mahsulot hook'lari — React Query bilan (XATO 3)
export function useKategoriyalar() {
  return useQuery({ queryKey: ['kategoriyalar'], queryFn: kategoriyaOlish });
}

export function useMashhurlar() {
  return useQuery({ queryKey: ['mashhur'], queryFn: () => mahsulotOlish({ mashhur: true }) });
}

export function useQidiruv(qidiruv: string) {
  return useQuery({
    queryKey: ['qidiruv', qidiruv],
    queryFn: () => mahsulotOlish({ qidiruv }),
    enabled: qidiruv.trim().length > 1,
  });
}

export function useKategoriyaMahsulotlari(slug: string | undefined) {
  return useQuery({
    queryKey: ['kat', slug],
    queryFn: () => mahsulotOlish({ kategoriya: slug }),
    enabled: !!slug,
  });
}
