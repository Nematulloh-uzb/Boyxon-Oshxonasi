import { api } from './client';

// Buyurtmalar API — savatcha ekrani shu orqali yuboradi
export interface BuyurtmaYaratish {
  mahsulotlar: { mahsulot: string; soni: number }[];
  manzil: string;
  moljal?: string;
  telefon: string;
  tolovUsuli: 'naqd' | 'karta' | 'click' | 'payme';
  promoKod?: string;
  izoh?: string;
}

export async function buyurtmaYarat(data: BuyurtmaYaratish) {
  const javob = await api.post('/orders', data);
  return javob.data.buyurtma;
}

export async function buyurtmalarim() {
  const javob = await api.get('/orders');
  return javob.data.buyurtmalar;
}
