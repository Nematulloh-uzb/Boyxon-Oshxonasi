import { create } from 'zustand';
import { i18n } from '../i18n';

// Sozlamalar — XATO 10, 11 tuzatish: Switch + i18n bilan real ishlaydi
export type Til = 'uz' | 'ru' | 'en';

interface SozlamaHolati {
  til: Til;
  bildirishnoma: boolean;
  qorongu: boolean;
  tilAlmash: (t: Til) => void;
  bildirishAlmash: (v: boolean) => void;
}

export const useSozlama = create<SozlamaHolati>()((set) => ({
  til: 'uz',
  bildirishnoma: true,
  qorongu: false,
  tilAlmash: (til) => {
    // BOSQICH 12: i18n bilan sinxron — til darhol almashadi
    void i18n.changeLanguage(til);
    set({ til });
  },
  bildirishAlmash: (bildirishnoma) => set({ bildirishnoma }),
}));
