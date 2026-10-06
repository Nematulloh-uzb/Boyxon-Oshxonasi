import { api } from './client';

export interface Mahsulot {
  _id: string;
  nom: string;
  tavsif: string;
  narx: number;
  eskiNarx?: number;
  rasmUrl: string;
  reyting: number;
  sharhlarSoni: number;
  tayyorlanishVaqti: string;
  mashhur: boolean;
  kategoriya?: { nom: string; slug: string };
}

export interface Kategoriya {
  _id: string;
  nom: string;
  slug: string;
  rasmUrl: string;
}

// XATO 3 tuzatish: hardcoded EMAS, API'dan
export async function kategoriyaOlish(): Promise<Kategoriya[]> {
  const { data } = await api.get('/kategoriyalar');
  return data.kategoriyalar as Kategoriya[];
}

export async function mahsulotOlish(params?: { qidiruv?: string; kategoriya?: string; mashhur?: boolean }): Promise<Mahsulot[]> {
  const { data } = await api.get('/mahsulotlar', { params });
  return data.mahsulotlar as Mahsulot[];
}

export async function mahsulotBittasi(id: string): Promise<Mahsulot> {
  const { data } = await api.get(`/mahsulotlar/${id}`);
  return data.mahsulot as Mahsulot;
}

export async function promoTekshir(kod: string, summa: number): Promise<{ chegirma: number }> {
  const { data } = await api.post('/promo/validate', { kod, summa });
  if (typeof data?.chegirma !== 'number' || !Number.isFinite(data.chegirma) || data.chegirma < 0) {
    throw new Error('Server promo chegirmasi uchun yaroqsiz javob qaytardi.');
  }
  return { chegirma: data.chegirma };
}
