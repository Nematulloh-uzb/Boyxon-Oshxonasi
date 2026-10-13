/**
 * Test uchun seed — test-e2e.ts tomonidan chaqiriladi.
 * env talab qilmaydi, to'g'ridan-to'g'ri ma'lumot yozadi.
 */
import { User } from '../models/User.model';
import { Category } from '../models/Category.model';
import { Dish } from '../models/Dish.model';
import { Promo } from '../models/Promo.model';
import { Order } from '../models/Order.model';

const CATS = [
  { name: "Sho'rvalar", slug: 'shorvalar', icon: 'Soup', order: 1 },
  { name: 'Palovlar', slug: 'palovlar', icon: 'CookingPot', order: 2 },
  { name: 'Somsa', slug: 'somsa', icon: 'Croissant', order: 3 },
  { name: 'Kaboblar', slug: 'kaboblar', icon: 'Flame', order: 4 },
  { name: 'Salatlar', slug: 'salatlar', icon: 'Salad', order: 5 },
  { name: 'Shirinliklar', slug: 'shirinliklar', icon: 'CakeSlice', order: 6 },
  { name: 'Ichimliklar', slug: 'ichimliklar', icon: 'CupSoda', order: 7 },
  { name: 'Non', slug: 'non', icon: 'Wheat', order: 8 },
];

interface SD { cat: string; name: string; desc: string; price: number; rating: number; featured?: boolean }
const DISHES: SD[] = [
  { cat: 'shorvalar', name: 'Mastava', desc: 'Guruch va goshtli quyuvchi sho‘rva.', price: 28000, rating: 4.7 },
  { cat: 'shorvalar', name: 'Shurva', desc: 'Ananaviy shurva.', price: 30000, rating: 4.6 },
  { cat: 'shorvalar', name: 'Moshxurda', desc: 'Moshli sho‘rva.', price: 26000, rating: 4.5 },
  { cat: 'palovlar', name: 'Boyxon Tuy Oshi', desc: 'Devzira guruch va quy goshti.', price: 45000, rating: 4.9, featured: true },
  { cat: 'palovlar', name: 'Samarqand Oshi', desc: 'Nuxat va mayizli palov.', price: 38000, rating: 4.8 },
  { cat: 'palovlar', name: 'Tovuq Palov', desc: 'Yengil tovuqli palov.', price: 32000, rating: 4.6 },
  { cat: 'somsa', name: 'Gushtli Somsa', desc: 'Tandirda pishgan somsa.', price: 12000, rating: 4.8, featured: true },
  { cat: 'somsa', name: 'Qovoqli Somsa', desc: 'Shirin qovoqli somsa.', price: 9000, rating: 4.4 },
  { cat: 'somsa', name: 'Kartoshkali Somsa', desc: 'Kartoshkali somsa.', price: 8000, rating: 4.3 },
  { cat: 'kaboblar', name: 'Jiz Kabob', desc: 'Chig‘da pishgan jiz.', price: 65000, rating: 4.9, featured: true },
  { cat: 'kaboblar', name: 'Tovuq Shashlik', desc: 'Tovuqli shashlik.', price: 42000, rating: 4.7 },
  { cat: 'kaboblar', name: 'Qiyma Kabob', desc: 'Lyulya-kabob.', price: 38000, rating: 4.6 },
  { cat: 'salatlar', name: 'Olivye', desc: 'Klassik olivye.', price: 25000, rating: 4.5 },
  { cat: 'salatlar', name: 'Sezar Salati', desc: 'Tovuq va parmezan.', price: 35000, rating: 4.6 },
  { cat: 'salatlar', name: 'Achchiq-chuchuk', desc: 'Pomidor va bodring.', price: 15000, rating: 4.7 },
  { cat: 'shirinliklar', name: 'Chak-chak', desc: 'Asalli chak-chak.', price: 20000, rating: 4.8, featured: true },
  { cat: 'shirinliklar', name: 'Halva', desc: 'Kungaboqar halvasi.', price: 14000, rating: 4.6 },
  { cat: 'shirinliklar', name: 'Quymoq', desc: 'Sutli quymoq.', price: 18000, rating: 4.5 },
  { cat: 'ichimliklar', name: 'Kompot (1 l)', desc: 'Uy kompoti.', price: 15000, rating: 4.7 },
  { cat: 'ichimliklar', name: 'Choy (choynak)', desc: '1 litr choy.', price: 8000, rating: 4.6 },
  { cat: 'ichimliklar', name: 'Ayron', desc: 'Uy ayroni.', price: 10000, rating: 4.5 },
  { cat: 'non', name: 'Patir Non', desc: 'Issiq patir.', price: 5000, rating: 4.8, featured: true },
  { cat: 'non', name: 'Yupqa Non', desc: 'Dasturxon noni.', price: 4000, rating: 4.6 },
  { cat: 'non', name: 'Gijda Non', desc: 'Samarqandcha gijda.', price: 6000, rating: 4.7 },
];

function slugify(name: string): string {
  return name.toLowerCase().replace(/['"]/g, '').replace(/[^a-z0-9\u0400-\u04FF]+/gi, '-').replace(/^-+|-+$/g, '').slice(0, 60);
}

export async function seedTestData(): Promise<void> {
  await Promise.all([User.deleteMany({}), Category.deleteMany({}), Dish.deleteMany({}), Promo.deleteMany({}), Order.deleteMany({})]);
  await User.create({ name: 'Admin', email: 'admin@boyxon.uz', password: 'Admin123!', role: 'admin', emailVerified: true });
  const demo = await User.create({ name: 'Aziz Karimov', email: 'aziz@example.com', password: 'User123!', emailVerified: true, addresses: [{ label: 'Uy', address: 'Toshkent, Yunusobod', isDefault: true }] });
  const cats = await Category.insertMany(CATS);
  const catId = (slug: string) => cats.find((c) => c.slug === slug)!._id;
  await Dish.insertMany(DISHES.map((d, i) => ({ name: d.name, slug: `${slugify(d.name)}-${i}`, description: d.desc, price: d.price, category: catId(d.cat), image: null, rating: d.rating, reviewCount: 50 + i, isFeatured: d.featured ?? false, isActive: true })));
  const now = new Date();
  const next = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
  await Promo.insertMany([
    { code: 'BOYXON20', description: '20% chegirma', type: 'percent', value: 20, minOrderAmount: 100000, maxDiscount: 30000, validFrom: now, validUntil: next, isActive: true },
    { code: 'WELCOME10', description: '10% chegirma', type: 'percent', value: 10, minOrderAmount: 0, validFrom: now, validUntil: next, isActive: true },
    { code: 'FREEDEL', description: '8000 chegirma', type: 'fixed', value: 8000, minOrderAmount: 50000, validFrom: now, validUntil: next, isActive: true },
  ]);
  const dishes = await Dish.find().limit(6);
  const statuses = ['pending', 'confirmed', 'packing', 'handed_to_taxi', 'delivered'];
  for (let i = 0; i < 5; i++) {
    const items = dishes.slice(i, i + 2).map((d) => ({ dish: d._id, name: d.name, price: d.price, quantity: i + 1 }));
    const subtotal = items.reduce((s, x) => s + x.price * x.quantity, 0);
    await Order.create({ user: demo._id, items, subtotal, deliveryFee: 12000, discount: 0, total: subtotal + 12000, deliveryType: 'delivery', address: { label: 'Uy', address: 'Toshkent' }, paymentMethod: 'cash', status: statuses[i], statusHistory: [{ status: statuses[i], timestamp: new Date() }] });
  }
}
