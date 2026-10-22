import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

/**
 * Sovuq start (Render free-tier uyqudan uyg'onishi) 30–60 soniya davom etadi.
 * Bu komponent 4 soniyadan keyin ham ma'lumot kelmasa, foydalanuvchiga
 * "Server uyg'onmoqda..." xabarini ko'rsatadi — sahifa jim osilib turmaydi.
 *
 * Faqat ma'lumoti yo'q (skeleton ko'rinib turgan) so'rovlar hisobga olinadi:
 * localStorage keshidan chizilgan menyu fonida yangilanayotganda xabar
 * bezovta qilmaydi.
 */

const NOTICE_ID = 'server-wake';
const SHOW_AFTER_MS = 3000;

export function ServerWakeNotice(): null {
  const qc = useQueryClient();
  const { t } = useTranslation();

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    let shown = false;

    const clearTimer = (): void => {
      if (timer !== null) {
        clearTimeout(timer);
        timer = null;
      }
    };

    const hide = (): void => {
      if (!shown) return;
      shown = false;
      toast.dismiss(NOTICE_ID);
    };

    const evaluate = (): void => {
      const waiting = qc
        .getQueryCache()
        .getAll()
        .some((query) => query.state.fetchStatus === 'fetching' && query.state.data === undefined);

      if (!waiting) {
        clearTimer();
        hide();
        return;
      }

      if (shown || timer !== null) return;

      timer = setTimeout(() => {
        timer = null;
        shown = true;
        toast.loading(t('auth.server_waking'), { id: NOTICE_ID });
      }, SHOW_AFTER_MS);
    };

    evaluate();
    const unsubscribe = qc.getQueryCache().subscribe(evaluate);

    return () => {
      unsubscribe();
      clearTimer();
      hide();
    };
  }, [qc, t]);

  return null;
}
