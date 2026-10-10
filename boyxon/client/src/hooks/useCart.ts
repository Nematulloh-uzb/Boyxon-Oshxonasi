import { useCartStore } from '../store/cart.store';

export function useCart() {
  const store = useCartStore();
  return {
    ...store,
    subtotal: store.subtotal(),
    count: store.count(),
    total: Math.max(0, store.subtotal() - store.discount),
  };
}
