// API umumiy tiplar — backend javoblari shu shaklda
export interface ApiXato {
  xabar: string;
}

export interface Sahifalangan<T> {
  jami: number;
  sahifa: number;
  limit: number;
  royxat: T[];
}

export interface TokenJuftlik {
  accessToken: string;
  refreshToken: string;
}
