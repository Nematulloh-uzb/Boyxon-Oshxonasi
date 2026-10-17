import { useEffect, useState } from 'react';

/** Qidiruv inputi uchun: qiymat `delay` ms tinchlangach qaytariladi. */
export function useDebouncedValue<T>(value: T, delay = 350): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}
