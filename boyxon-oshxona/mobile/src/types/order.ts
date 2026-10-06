// Buyurtma tipi — backend Order.model bilan bir xil
export type BuyurtmaHolat = 'yangi' | 'tasdiqlandi' | 'tayyorlanmoqda' | 'yolda' | 'yetkazildi' | 'bekor_qilindi';

export interface BuyurtmaTip {
  _id: string;
  raqam: string;
  oraliqJami: number;
  yetkazishNarxi: number;
  chegirma: number;
  jami: number;
  holat: BuyurtmaHolat;
  manzil: string;
  yaratilgan: string;
}
