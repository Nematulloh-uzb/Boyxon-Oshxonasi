// Mahsulot va kategoriya tiplari — API bilan bir xil
export interface KategoriyaTip {
  _id: string;
  nom: string;
  slug: string;
  rasmUrl: string;
}

export interface MahsulotTip {
  _id: string;
  nom: string;
  tavsif: string;
  narx: number;
  eskiNarx?: number;
  rasmUrl: string;
  rasmlar: string[];
  reyting: number;
  sharhlarSoni: number;
  tayyorlanishVaqti: string;
  mashhur: boolean;
  kategoriya?: KategoriyaTip;
}
