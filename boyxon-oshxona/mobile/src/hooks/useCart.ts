import { oraliqJami, savatSoni, umumiyJami, useSavat, yetkazishNarxi } from '../store/cart.store';

// Savat hook — selectorlar bilan tayyor hisob
export function useSavatHisob() {
  const soni = useSavat(savatSoni);
  const oraliq = useSavat(oraliqJami);
  const yetkazish = useSavat(yetkazishNarxi);
  const jami = useSavat(umumiyJami);
  const promoKod = useSavat((h) => h.promoKod);
  const chegirma = useSavat((h) => h.chegirma);
  return { soni, oraliq, yetkazish, jami, promoKod, chegirma };
}
