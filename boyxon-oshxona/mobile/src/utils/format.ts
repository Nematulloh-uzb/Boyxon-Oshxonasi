// Narx: 45000 -> "45 000 so'm" (DESIGN.md)
export function narxFormat(som: number): string {
  const butun = Math.round(som).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${butun} so'm`;
}

// Telefon: +998901234567 -> "+998 90 123 45 67"
export function telefonFormat(qiymat: string): string {
  const raqam = qiymat.replace(/\D/g, '');
  const toza = raqam.startsWith('998') ? raqam.slice(3) : raqam.slice(-9);
  if (toza.length !== 9) return qiymat;
  return `+998 ${toza.slice(0, 2)} ${toza.slice(2, 5)} ${toza.slice(5, 7)} ${toza.slice(7, 9)}`;
}
