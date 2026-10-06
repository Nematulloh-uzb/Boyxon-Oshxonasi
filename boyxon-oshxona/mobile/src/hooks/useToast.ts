import { useCallback, useState } from 'react';
import type { ToastTuri } from '../components/ui/Toast';

// Toast hook — XATO 2: alert() o'rniga
// const { xabar, korsat } = useToast(); korsat('Saqlandi', 'muvaffaqiyat');
export function useToast() {
  const [xabar, setXabar] = useState<{ matn: string; tur: ToastTuri } | null>(null);

  const korsat = useCallback((matn: string, tur: ToastTuri = 'info') => {
    setXabar({ matn, tur });
  }, []);

  const yopish = useCallback(() => setXabar(null), []);

  return { xabar, korsat, yopish };
}
