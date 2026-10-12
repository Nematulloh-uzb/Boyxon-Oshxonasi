import { connectDb, disconnectDb } from '../config/db';
import { env } from '../config/env';
import { User } from '../models/User.model';
import { Category } from '../models/Category.model';
import { Dish } from '../models/Dish.model';
import { Promo } from '../models/Promo.model';
import { Order } from '../models/Order.model';

const CATS = [
  { name: 'Sho‘rvalar', slug: 'shorvalar', icon: 'Soup', order: 1, nameRu: 'Супы', nameEn: 'Soups' },
  { name: 'Palovlar', slug: 'palovlar', icon: 'CookingPot', order: 2, nameRu: 'Плов', nameEn: 'Plov' },
  { name: 'Somsa', slug: 'somsa', icon: 'Croissant', order: 3, nameRu: 'Самса', nameEn: 'Samsa' },
  { name: 'Kaboblar', slug: 'kaboblar', icon: 'Flame', order: 4, nameRu: 'Шашлыки', nameEn: 'Kebabs' },
  { name: 'Salatlar', slug: 'salatlar', icon: 'Salad', order: 5, nameRu: 'Салаты', nameEn: 'Salads' },
  { name: 'Shirinliklar', slug: 'shirinliklar', icon: 'CakeSlice', order: 6, nameRu: 'Десерты', nameEn: 'Desserts' },
  { name: 'Ichimliklar', slug: 'ichimliklar', icon: 'CupSoda', order: 7, nameRu: 'Напитки', nameEn: 'Drinks' },
  { name: 'Non', slug: 'non', icon: 'Wheat', order: 8, nameRu: 'Лепёшки', nameEn: 'Bread' },
];

type SeedDish = {
  cat: string; name: string; desc: string; price: number; oldPrice?: number;
  tags?: string[]; rating: number; featured?: boolean; time?: number;
};

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/['"]/g, '')
      .replace(/[^a-z0-9\u0400-\u04FF]+/gi, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) + '-' + Math.random().toString(36).slice(2, 7)
  );
}

const DISHES: SeedDish[] = [
  { cat: 'shorvalar', name: 'Mastava', desc: 'Mol gushti, guruch va sabzavotlar bilan quyuq mastava.', price: 28000, rating: 4.7, time: 20 },
  { cat: 'shorvalar', name: 'Shurva', desc: 'Quy gushtidan ananaviy shurva, nuxat bilan.', price: 30000, rating: 4.6, time: 25 },
  { cat: 'shorvalar', name: 'Moshxurda', desc: 'Mosh va gushtli tuyimli shurva.', price: 26000, rating: 4.5, time: 20 },
  { cat: 'palovlar', name: 'Boyxon Tuy Oshi', desc: 'Quy gushti, sariq sabzi, devzira guruch.', price: 45000, oldPrice: 55000, rating: 4.9, featured: true, time: 30, tags: ['top'] },
  { cat: 'palovlar', name: 'Samarqand Oshi', desc: 'Mol gushti, nuxat, mayiz bilan samarqandcha.', price: 38000, rating: 4.8, featured: true, time: 25 },
  { cat: 'palovlar', name: 'Tovuqli Palov', desc: 'Yengil va mazali — tovuq gushtidan palov.', price: 32000, rating: 4.6, time: 25 },
  { cat: 'somsa', name: 'Gushtli Somsa', desc: 'Tandirda pishgan, suvli gushtli somsa.', price: 12000, rating: 4.8, featured: true, time: 15, tags: ['top'] },
  { cat: 'somsa', name: 'Qovoqli Somsa', desc: 'Shirin qovoq va piyozli, parhez somsa.', price: 9000, rating: 4.4, time: 15, tags: ['vegetarian'] },
  { cat: 'somsa', name: 'Kartoshkali Somsa', desc: 'Kartoshka va kukatli qarsildoq somsa.', price: 8000, rating: 4.3, time: 15, tags: ['vegetarian'] },
  { cat: 'kaboblar', name: 'Jiz Kabob', desc: 'Chugda pishgan yumshoq jiz, piyoz va sumax bilan.', price: 65000, rating: 4.9, featured: true, time: 20, tags: ['top'] },
  { cat: 'kaboblar', name: 'Tovuq Shashlik', desc: '4 shampurlik tovuq shashlik tuplami.', price: 42000, rating: 4.7, time: 20 },
  { cat: 'kaboblar', name: 'Qiyma Kabob', desc: 'Lyulya-kabob — ziravorli qiyma, lavash bilan.', price: 38000, rating: 4.6, time: 20, tags: ['spicy'] },
  { cat: 'salatlar', name: 'Olivye', desc: 'Klassik olivye — uy mayonezi bilan.', price: 25000, rating: 4.5, time: 10 },
  { cat: 'salatlar', name: 'Sezar Salati', desc: 'Tovuq filesi, parmezan va sezar sousi.', price: 35000, rating: 4.6, time: 10 },
  { cat: 'salatlar', name: 'Achchiq-chuchuk', desc: 'Pomidor, bodring, piyoz va rayhon.', price: 15000, rating: 4.7, time: 5, tags: ['vegetarian'] },
  { cat: 'shirinliklar', name: 'Chak-chak', desc: 'Asal bilan yopilgan klassik chak-chak.', price: 20000, rating: 4.8, featured: true, time: 5 },
  { cat: 'shirinliklar', name: 'Paxlava (4 dona)', desc: 'Yongoqli paxlava qutisi.', price: 28000, rating: 4.9, time: 5 },
  { cat: 'shirinliklar', name: 'Sutli Quymoq', desc: 'Issiq, yumshoq quymoqlar, smetana bilan.', price: 18000, rating: 4.5, time: 10 },
  { cat: 'ichimliklar', name: 'Kompot (1 l)', desc: 'Olma, urik va mayizli uy kompoti.', price: 15000, rating: 4.7, time: 5 },
  { cat: 'ichimliklar', name: 'Choy (choynak)', desc: 'Kuk yoki qora choy — 1 litrlik choynak.', price: 8000, rating: 4.6, time: 5 },
  { cat: 'ichimliklar', name: 'Ayron', desc: 'Uy ayroni — issiqqa eng zur.', price: 10000, rating: 4.5, time: 5 },
  { cat: 'non', name: 'Patir Non', desc: 'Tandirda yopilgan issiq patir.', price: 5000, rating: 4.8, featured: true, time: 5 },
  { cat: 'non', name: 'Yupqa Non', desc: 'Kundalik dasturxon noni.', price: 4000, rating: 4.6, time: 5 },
  { cat: 'non', name: 'Gijda Non', desc: 'Samarqandcha gijda — qalin va tuyimli.', price: 6000, rating: 4.7, time: 5 },
];

async function seedData(): Promise<void> {
  console.log('🌱 Seed boshlandi...');

  await User.deleteMany({});
  const admin = await User.create({ name: 'Admin', email: env.ADMIN_EMAIL.toLowerCase(), password: env.ADMIN_PASSWORD, role: 'admin' });
  const demo = await User.create({
    name: 'Aziz Karimov', email: 'aziz@example.com', phone: '+998 90 123 45 67', password: 'User123!',
    addresses: [{ label: 'Uy', address: 'Toshkent, Yunusobod, 12-mavze, 5-uy', isDefault: true }],
  });

  await Category.deleteMany({});
  const cats = await Category.insertMany(CATS);
  const catId = (slug: string) => cats.find((c) => c.slug === slug)!._id;

  await Dish.deleteMany({});
  await Dish.insertMany(
    DISHES.map((d) => ({
      name: d.name, slug: slugify(d.name), description: d.desc, price: d.price, oldPrice: d.oldPrice,
      category: catId(d.cat), image: null, deliveryTime: d.time ?? 30,
      tags: d.tags ?? [], rating: d.rating, reviewCount: 40 + (d.rating * 100) % 400 | 0,
      isFeatured: d.featured ?? false, isActive: true,
    })),
  );

  await Promo.deleteMany({});
  const now = new Date();
  const next = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
  await Promo.insertMany([
    { code: 'BOYXON20', description: '20% chegirma (max 30 000)', type: 'percent', value: 20, minOrderAmount: 100000, maxDiscount: 30000, validFrom: now, validUntil: next, isActive: true },
    { code: 'WELCOME10', description: 'Birinchi buyurtmaga 10%', type: 'percent', value: 10, minOrderAmount: 0, validFrom: now, validUntil: next, isActive: true },
    { code: 'FREEDEL', description: '8 000 so‘m chegirma', type: 'fixed', value: 8000, minOrderAmount: 50000, validFrom: now, validUntil: next, isActive: true },
  ]);

  await Order.deleteMany({});
  const dishes = await Dish.find().limit(6);
  const statuses = ['pending', 'confirmed', 'packing', 'handed_to_taxi', 'delivered'];
  for (let i = 0; i < 5; i++) {
    const st = statuses[i];
    const items = dishes.slice(i, i + 2).map((d) => ({ dish: d._id, name: d.name, price: d.price, quantity: i + 1 }));
    const subtotal = items.reduce((s, x) => s + x.price * x.quantity, 0);
    await Order.create({
      user: demo._id, items, subtotal, deliveryFee: 12000, discount: 0, total: subtotal + 12000,
      deliveryType: 'delivery', address: { label: 'Uy', address: 'Toshkent, Yunusobod' },
      paymentMethod: 'cash', status: st, statusHistory: [{ status: st, timestamp: new Date() }],
    });
  }

  void admin;
  console.log('✅ Seed tayyor: 1 admin, 1 demo, 8 kategoriya, 24 taom, 3 promo, 5 buyurtma');
}

/**
 * Seed ma'lumotini yozadi. DB allaqachon ulangan bo'lishi kerak.
 * `npm run seed` (standalone) va `dev:local` (avtomatik) uchun ishlatiladi.
 */
export async function runSeed(): Promise<void> {
  await seedData();
}

// Faqat to'g'ridan-to'g'ri ishga tushirilganda (npm run seed) DB ulanadi.
if (require.main === module) {
  connectDb()
    .then(runSeed)
    .then(disconnectDb)
    .then(() => process.exit(0))
    .catch((e) => {
      console.error('❌ Seed xatosi:', e);
      process.exit(1);
    });
}
