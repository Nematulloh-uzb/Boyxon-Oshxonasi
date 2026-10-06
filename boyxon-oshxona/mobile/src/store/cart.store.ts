import { create } from 'zustand';

// Savat elementi
export interface SavatElement {
  id: string; // mahsulot id
  nom: string;
  narx: number;
  rasmUrl: string;
  soni: number;
}

export interface SavatHolati {
  elementlar: SavatElement[];
  promoKod: string | null;
  chegirma: number; // promo chegirma summasi
  qoshish: (m: Omit<SavatElement, 'soni'>, soni?: number) => void;
  miqdor: (id: string, soni: number) => void; // XATO 5 tuzatish
  ochirish: (id: string) => void;
  tozalash: () => void;
  promoQoyish: (kod: string, chegirma: number) => void;
  promoOchirish: () => void;
}

// XATO 1, 4, 5 tuzatish: DOM emas, Zustand orqali hisob-kitob
export const useSavat = create<SavatHolati>()((set) => ({
  elementlar: [],
  promoKod: null,
  chegirma: 0,

  qoshish: (m, soni = 1) =>
    set((h) => {
      const qoshiladiganSoni = Number.isFinite(soni)
        ? Math.max(1, Math.min(Math.floor(soni), 50))
        : 1;
      const topildi = h.elementlar.find((e) => e.id === m.id);
      if (topildi) {
        return {
          elementlar: h.elementlar.map((e) =>
            e.id === m.id ? { ...e, soni: Math.min(e.soni + qoshiladiganSoni, 50) } : e,
          ),
          promoKod: null,
          chegirma: 0,
        };
      }
      return {
        elementlar: [...h.elementlar, { ...m, soni: qoshiladiganSoni }],
        promoKod: null,
        chegirma: 0,
      };
    }),

  miqdor: (id, soni) =>
    set((h) => {
      if (!Number.isFinite(soni)) return h;
      return {
        elementlar:
          soni <= 0
            ? h.elementlar.filter((e) => e.id !== id)
            : h.elementlar.map((e) =>
                e.id === id ? { ...e, soni: Math.max(1, Math.min(Math.floor(soni), 50)) } : e,
              ),
        promoKod: null,
        chegirma: 0,
      };
    }),

  ochirish: (id) => set((h) => ({
    elementlar: h.elementlar.filter((e) => e.id !== id),
    promoKod: null,
    chegirma: 0,
  })),
  tozalash: () => set({ elementlar: [], promoKod: null, chegirma: 0 }),
  promoQoyish: (kod, chegirma) => set((h) => ({
    promoKod: kod,
    chegirma: Number.isFinite(chegirma)
      ? Math.max(0, Math.min(Math.floor(chegirma), oraliqJami(h)))
      : 0,
  })),
  promoOchirish: () => set({ promoKod: null, chegirma: 0 }),
}));

// Selectorlar — avtomatik hisob (XATO 4)
export const savatSoni = (h: SavatHolati) => h.elementlar.reduce((s, e) => s + e.soni, 0);
export const oraliqJami = (h: SavatHolati) => h.elementlar.reduce((s, e) => s + e.narx * e.soni, 0);
export const yetkazishNarxi = (h: SavatHolati) => {
  const oraliq = oraliqJami(h);
  if (oraliq === 0) return 0;
  return oraliq >= 200000 ? 0 : 14000;
};
export const umumiyJami = (h: SavatHolati) =>
  Math.max(0, oraliqJami(h) + yetkazishNarxi(h) - h.chegirma);
