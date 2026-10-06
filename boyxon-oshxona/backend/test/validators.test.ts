// Smoke test: validator sxemalar to'g'ri ishlaydimi
// Ishga tushirish: npm test (ts-node bilan)
import { buyurtmaSxema, katalogQuerySxema, promoTekshirSxema, royxatSxema, telefonSxema } from '../src/validators';

function tasdiq(shart: boolean, nom: string): void {
  if (!shart) {
    console.error(`❌ ${nom}`);
    process.exitCode = 1;
  } else {
    console.log(`✅ ${nom}`);
  }
}

tasdiq(telefonSxema.safeParse('+998 90 123 45 67').success, 'telefon togri');
tasdiq(!telefonSxema.safeParse('+998901234567').success, 'telefon bushliqsiz xato');
tasdiq(!telefonSxema.safeParse('901234567').success, 'telefon kodsiz xato');
tasdiq(katalogQuerySxema.safeParse({ mashhur: 'false' }).data?.mashhur === false, 'mashhur false query');
tasdiq(katalogQuerySxema.safeParse({ mashhur: 'true' }).data?.mashhur === true, 'mashhur true query');
tasdiq(royxatSxema.safeParse({ ism: 'Aziz', telefon: '+998 90 123 45 67', parol: 'boyxon123' }).success, 'royxat togri');
tasdiq(!royxatSxema.safeParse({ ism: 'A', telefon: '+998 90 123 45 67', parol: '123' }).success, 'royxat xato');
tasdiq(promoTekshirSxema.safeParse({ kod: 'boyxon20', summa: 100000 }).success, 'promo kichik harf');
tasdiq(
  buyurtmaSxema.safeParse({
    mahsulotlar: [{ mahsulot: '507f1f77bcf86cd799439011', soni: 2 }],
    manzil: 'Toshkent, Yunusobod, 12-mavze',
    telefon: '+998 90 123 45 67',
    tolovUsuli: 'naqd',
  }).success,
  'buyurtma togri',
);
tasdiq(
  !buyurtmaSxema.safeParse({ mahsulotlar: [], manzil: 'a', telefon: '123', tolovUsuli: 'naqd' }).success,
  'buyurtma xato',
);
