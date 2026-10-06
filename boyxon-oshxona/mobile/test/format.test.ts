import { narxFormat, telefonFormat } from '../src/utils/format';

// Test: format.ts — "45 000 so'm" va "+998 90 123 45 67"
// Ishga tushirish: npx ts-node test/format.test.ts (yoki jest)
function tasdiq(shart: boolean, nom: string): void {
  if (!shart) {
    throw new Error(`❌ ${nom}`);
  }
  console.log(`✅ ${nom}`);
}

tasdiq(narxFormat(45000) === "45 000 so'm", 'narx 45000');
tasdiq(narxFormat(146000) === "146 000 so'm", 'narx 146000');
tasdiq(narxFormat(0) === "0 so'm", 'narx 0');
tasdiq(telefonFormat('+998901234567') === '+998 90 123 45 67', 'telefon toliq');
tasdiq(telefonFormat('901234567') === '+998 90 123 45 67', 'telefon qisqa');
