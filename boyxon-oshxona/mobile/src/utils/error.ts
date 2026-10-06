import axios from 'axios';

export function xatoXabari(xato: unknown, zaxira: string): string {
  if (axios.isAxiosError(xato)) {
    const javob: unknown = xato.response?.data;
    if (
      typeof javob === 'object' &&
      javob !== null &&
      'xabar' in javob &&
      typeof javob.xabar === 'string'
    ) {
      return javob.xabar;
    }

    if (!xato.response) return 'Server bilan aloqa yo‘q. Internetni tekshirib, qayta urinib ko‘ring.';
  }

  if (xato instanceof Error && xato.message.trim()) return xato.message;
  return zaxira;
}
