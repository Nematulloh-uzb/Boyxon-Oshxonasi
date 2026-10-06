import { useTranslation } from 'react-i18next';
import { useSozlama } from '../store/settings.store';
import { i18n } from '../i18n';
import '../i18n';

// BOSQICH 12: til hook — Zustand + i18next sinxron
// Ekranlarda: const { t, til, tilAlmash } = useTil();
export function useTil() {
  const { t } = useTranslation();
  const til = useSozlama((h) => h.til);
  const tilAlmash = useSozlama((h) => h.tilAlmash);
  return { t, til, tilAlmash, i18n };
}
