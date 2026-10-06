import bcrypt from 'bcryptjs';
import { dbUlanish, dbUzish } from './config/db';
import { Foydalanuvchi } from './models/User.model';
import { Kategoriya } from './models/Category.model';
import { Mahsulot } from './models/Product.model';
import { PromoKod } from './models/PromoCode.model';

// Rasm URL — Cloudinary bo'lishi kerak (XATO 13). Hozircha placeholder.
function rasm(seed: string): string {
  return `https://picsum.photos/seed/${seed}/800/600`;
}

async function seed(): Promise<void> {
  await dbUlanish();
  console.log('🌱 Seed boshlandi...');

  // 1) Kategoriyalar
  await Kategoriya.deleteMany({});
  const kategoriyalar = await Kategoriya.insertMany([
    { nom: 'Oshlar', slug: 'oshlar', rasmUrl: rasm('osh'), tartib: 1, faol: true },
    { nom: "Sho'rvalar", slug: 'shorvalar', rasmUrl: rasm('shorva'), tartib: 2, faol: true },
    { nom: 'Kaboblar', slug: 'kaboblar', rasmUrl: rasm('kabob'), tartib: 3, faol: true },
    { nom: 'Salatlar', slug: 'salatlar', rasmUrl: rasm('salat'), tartib: 4, faol: true },
    { nom: 'Ichimliklar', slug: 'ichimliklar', rasmUrl: rasm('ichimlik'), tartib: 5, faol: true },
    { nom: 'Shirinliklar', slug: 'shirinliklar', rasmUrl: rasm('shirinlik'), tartib: 6, faol: true },
  ]);
  const kat = (slug: string) => kategoriyalar.find((k) => k.slug === slug)?._id;

  // 2) Mahsulotlar — 1-qism
  await Mahsulot.deleteMany({});
  await Mahsulot.insertMany([
    {
      nom: "Boyxon To'y Oshi",
      tavsif: "Qo'y go'shti, sariq sabzi, devzira guruch. To'y oshining asl ta'mi.",
      narx: 45000, eskiNarx: 55000,
      rasmUrl: rasm('toy-oshi'), rasmlar: [],
      kategoriya: kat('oshlar'),
      reyting: 4.9, sharhlarSoni: 2314,
      tayyorlanishVaqti: '25-30 daq', ogirlik: '450 g',
      achchiqlik: 0, mashhur: true, mavjud: true,
      tarkib: ["Qo'y go'shti", 'Devzira guruch', 'Sariq sabzi', 'Piyoz', 'Zira'],
    },
    {
      nom: 'Samarqand Oshi',
      tavsif: "Mol go'shti, no'xat, mayiz bilan — samarqandcha uslubda.",
      narx: 38000,
      rasmUrl: rasm('samarqand-oshi'), rasmlar: [],
      kategoriya: kat('oshlar'),
      reyting: 4.8, sharhlarSoni: 1872,
      tayyorlanishVaqti: '20-25 daq', ogirlik: '400 g',
      achchiqlik: 0, mashhur: true, mavjud: true,
      tarkib: ["Mol go'shti", 'Guruch', "No'xat", 'Mayiz', 'Sabzi'],
    },
    {
      nom: "Mastava Sho'rva",
      tavsif: "Mol go'shti, guruch va sabzavotlar bilan quyuq mastava.",
      narx: 28000,
      rasmUrl: rasm('mastava'), rasmlar: [],
      kategoriya: kat('shorvalar'),
      reyting: 4.7, sharhlarSoni: 964,
      tayyorlanishVaqti: '15-20 daq', ogirlik: '350 g',
      achchiqlik: 1, mashhur: true, mavjud: true,
      tarkib: ["Mol go'shti", 'Guruch', 'Kartoshka', 'Sabzi', "Ko'katlar"],
    },
    {
      nom: 'Jiz Kabob',
      tavsif: "Cho'g'da pishgan yumshoq jiz — piyoz va sumax bilan.",
      narx: 65000,
      rasmUrl: rasm('jiz'), rasmlar: [],
      kategoriya: kat('kaboblar'),
      reyting: 4.9, sharhlarSoni: 1530,
      tayyorlanishVaqti: '20 daq', ogirlik: '350 g',
      achchiqlik: 1, mashhur: true, mavjud: true,
      tarkib: ["Qo'y go'shti", 'Piyoz', 'Sumax', 'Zira'],
    },
    {
      nom: 'Tovuq Shashlik',
      tavsif: "Tovuq son go'shtidan 4 shampurlik shashlik to'plami.",
      narx: 42000,
      rasmUrl: rasm('shashlik'), rasmlar: [],
      kategoriya: kat('kaboblar'),
      reyting: 4.7, sharhlarSoni: 1108,
      tayyorlanishVaqti: '15-20 daq', ogirlik: '400 g',
      achchiqlik: 1, mashhur: true, mavjud: true,
      tarkib: ['Tovuq gushti', 'Piyoz', 'Limon', 'Ziravorlar'],
    },
    {
      nom: 'Olivye Salati',
      tavsif: 'Klassik olivye — kolbasa va uy mayonezi bilan.',
      narx: 25000,
      rasmUrl: rasm('olivye'), rasmlar: [],
      kategoriya: kat('salatlar'),
      reyting: 4.5, sharhlarSoni: 640,
      tayyorlanishVaqti: '10 daq', ogirlik: '250 g',
      achchiqlik: 0, mashhur: false, mavjud: true,
      tarkib: ['Kartoshka', 'Kolbasa', "No'xat", 'Tuxum', 'Mayonez'],
    },
  ]);
// QISM-2: qolgan mahsulotlar + promo + demo mijoz
  await Mahsulot.insertMany([
    {
      nom: 'Sezar Salati',
      tavsif: 'Tovuq filesi, parmezan va sezar sousi bilan.',
      narx: 35000,
      rasmUrl: rasm('sezar'), rasmlar: [],
      kategoriya: kat('salatlar'),
      reyting: 4.6, sharhlarSoni: 428,
      tayyorlanishVaqti: '10-15 daq', ogirlik: '280 g',
      achchiqlik: 0, mashhur: false, mavjud: true,
      tarkib: ['Tovuq filesi', 'Aysberg', 'Parmezan', 'Sezar sousi'],
    },
    {
      nom: 'Kompot (1 l)',
      tavsif: "Olma, orik va mayizli uy kompoti — 1 litr.",
      narx: 15000,
      rasmUrl: rasm('kompot'), rasmlar: [],
      kategoriya: kat('ichimliklar'),
      reyting: 4.7, sharhlarSoni: 356,
      tayyorlanishVaqti: '5 daq',
      achchiqlik: 0, mashhur: false, mavjud: true,
      tarkib: ['Olma', 'Orik', 'Mayiz'],
    },
    {
      nom: 'Chak-chak',
      tavsif: 'Asal bilan yopilgan klassik chak-chak.',
      narx: 20000,
      rasmUrl: rasm('chakchak'), rasmlar: [],
      kategoriya: kat('shirinliklar'),
      reyting: 4.8, sharhlarSoni: 720,
      tayyorlanishVaqti: '5 daq', ogirlik: '300 g',
      achchiqlik: 0, mashhur: true, mavjud: true,
      tarkib: ['Un', 'Tuxum', 'Asal'],
    },
    {
      nom: 'Paxlava (4 dona)',
      tavsif: "Yongoqli paxlava — 4 donalik quti.",
      narx: 28000,
      rasmUrl: rasm('paxlava'), rasmlar: [],
      kategoriya: kat('shirinliklar'),
      reyting: 4.9, sharhlarSoni: 615,
      tayyorlanishVaqti: '5 daq', ogirlik: '320 g',
      achchiqlik: 0, mashhur: true, mavjud: true,
      tarkib: ["Yongoq", 'Asal', 'Xamir'],
    },
  ]);

  // 3) Promo-kodlar
  await PromoKod.deleteMany({});
  const hozir = new Date();
  const kelasi = new Date(hozir.getFullYear() + 1, hozir.getMonth(), hozir.getDate());
  await PromoKod.insertMany([
    {
      kod: 'BOYXON20', tavsif: 'Birinchi buyurtmaga 20% chegirma',
      turi: 'foiz', qiymat: 20, minSumma: 50000, maxChegirma: 30000,
      boshlanish: hozir, tugash: kelasi, limit: 10000, ishlatilgan: 0, faol: true,
    },
    {
      kod: 'XUSHKELIBSIZ', tavsif: '10000 som chegirma',
      turi: 'summa', qiymat: 10000, minSumma: 60000,
      boshlanish: hozir, tugash: kelasi, limit: 5000, ishlatilgan: 0, faol: true,
    },
  ]);

  // 4) Demo mijoz: +998 90 123 45 67 / boyxon123
  await Foydalanuvchi.deleteMany({ telefon: '+998 90 123 45 67' });
  const parolHash = await bcrypt.hash('boyxon123', 10);
  await Foydalanuvchi.create({
    ism: 'Demo Mijoz', telefon: '+998 90 123 45 67', parolHash,
    rol: 'mijoz', til: 'uz', bildirishnoma: true,
    manzillar: [{ nom: 'Uy', manzil: 'Toshkent, Yunusobod, 12-mavze', asosiy: true }],
  });

  console.log('Seed tayyor: 6 kategoriya, 10 mahsulot, 2 promo, 1 demo');
  await dbUzish();
}

seed().catch((xato) => {
  console.error('Seed xatosi:', xato);
  process.exit(1);
});

