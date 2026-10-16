/**
 * E2E smoke test — mongodb-memory-server bilan real HTTP so'rovlar.
 * Ishga tushirish: npx tsx src/utils/test-e2e.ts
 */
import { MongoMemoryServer } from 'mongodb-memory-server-core';
import http from 'http';
import type { AddressInfo } from 'net';

let passed = 0;
let failed = 0;
function check(name: string, cond: boolean, extra = ''): void {
  if (cond) { passed++; console.log(`  ✅ ${name}`); }
  else { failed++; console.log(`  ❌ ${name} ${extra}`); }
}

interface ReqResult { status: number; body: any; cookie: string | null; }

function request(base: string, method: string, path: string, body?: unknown, cookie?: string, token?: string): Promise<ReqResult> {
  return new Promise((resolve, reject) => {
    const url = new URL(base + path);
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (cookie) headers.Cookie = cookie;
    if (token) headers.Authorization = `Bearer ${token}`;
    const payload = body ? JSON.stringify(body) : undefined;
    if (payload) headers['Content-Length'] = String(Buffer.byteLength(payload));
    const req = http.request(
      { hostname: url.hostname, port: url.port, path: url.pathname + url.search, method, headers },
      (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => {
          let parsed: any = {};
          try { parsed = JSON.parse(data); } catch { parsed = data; }
          const sc = res.headers['set-cookie'];
          const cookieVal = Array.isArray(sc) ? sc.map((c) => c.split(';')[0]).join('; ') : null;
          resolve({ status: res.statusCode ?? 0, body: parsed, cookie: cookieVal });
        });
      },
    );
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}


async function main(): Promise<void> {
  console.log('🧪 E2E test boshlandi (mongodb-memory-server)...');
  const mem = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mem.getUri('boyxon_test');
  process.env.JWT_ACCESS_SECRET = 'test-access-secret-0123456789abcdef';
  process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-0123456789abcdef';
  process.env.ADMIN_EMAIL = 'admin@boyxon.uz';
  process.env.ADMIN_PASSWORD = 'Admin123!';
  process.env.NODE_ENV = 'test';

  const { connectDb } = await import('../config/db');
  await connectDb();
  const { seedTestData } = await import('./test-seed-data');
  await seedTestData();
  console.log("🌱 Test ma'lumotlari yuklandi");

  const { createApp } = await import('../app');
  const server = http.createServer(createApp());
  await new Promise<void>((r) => server.listen(0, r));
  const { port } = server.address() as AddressInfo;
  const base = `http://127.0.0.1:${port}/api`;
  const root = `http://127.0.0.1:${port}`;

  const health = await request(root, 'GET', '/health');
  check('GET /health → 200', health.status === 200);

  const cats = await request(base, 'GET', '/categories');
  const catList = (cats.body as { data: { slug: string }[] }).data;
  check('GET /categories → 8 kategoriya', cats.status === 200 && catList?.length === 8, `status ${cats.status} got ${catList?.length}`);

  const dishes = await request(base, 'GET', '/dishes?page=1&limit=12');
  const dishList = (dishes.body as { data: { _id: string; slug: string; image: string | null }[] }).data;
  const firstDish = dishList?.[0];
  check('GET /dishes → 24 taom (limit 12)', dishes.status === 200 && dishList?.length === 12, `got ${dishList?.length}`);
  check('Taomda slug bor', Boolean(firstDish?.slug));
  check('Taom image=null (placeholder)', firstDish?.image === null);

  if (firstDish?.slug) {
    const one = await request(base, 'GET', `/dishes/${firstDish.slug}`);
    check('GET /dishes/:slug → 200', one.status === 200, `status ${one.status}`);
  }
  check('GET /dishes/featured → 200', (await request(base, 'GET', '/dishes/featured')).status === 200);
  check('GET /dishes?search=palov → 200', (await request(base, 'GET', '/dishes?search=palov')).status === 200);

  const login = await request(base, 'POST', '/auth/login', { email: 'aziz@example.com', password: 'User123!' });
  const accessToken = (login.body as { data: { accessToken: string } }).data?.accessToken;
  const cookie = login.cookie;
  check('POST /auth/login → 200 + token + cookie', login.status === 200 && Boolean(accessToken) && Boolean(cookie), `status ${login.status}`);

  check('GET /auth/me (auth) → 200', (await request(base, 'GET', '/auth/me', undefined, cookie ?? undefined, accessToken)).status === 200);
  check('GET /auth/me (no token) → 401', (await request(base, 'GET', '/auth/me')).status === 401);

  const promo = await request(base, 'POST', '/promos/validate', { code: 'WELCOME10', subtotal: 100000 });
  check('POST /promos/validate WELCOME10 → 200', promo.status === 200, `status ${promo.status} ${JSON.stringify(promo.body)}`);

  const orderItems = dishList.slice(0, 2).map((d) => ({ dish: d._id, quantity: 2 }));
  const order = await request(base, 'POST', '/orders',
    { items: orderItems, deliveryType: 'delivery', address: { label: 'Uy', address: 'Toshkent' }, paymentMethod: 'cash' },
    cookie ?? undefined, accessToken);
  const orderId = (order.body as { data: { _id: string; orderNumber: string } }).data?._id;
  check('POST /orders → 201 + orderNumber', (order.status === 201 || order.status === 200) && Boolean((order.body as { data: { orderNumber: string } }).data?.orderNumber), `status ${order.status} ${JSON.stringify(order.body)}`);
  check('GET /users/me/orders → 200', (await request(base, 'GET', '/users/me/orders', undefined, cookie ?? undefined, accessToken)).status === 200);
  check('GET /push/vapid-public-key → 200', (await request(base, 'GET', '/push/vapid-public-key')).status === 200);

  const adminLogin = await request(base, 'POST', '/auth/login', { email: 'admin@boyxon.uz', password: 'Admin123!' });
  const adminToken = (adminLogin.body as { data: { accessToken: string } }).data?.accessToken;
  const adminCookie = adminLogin.cookie;
  check('Admin login → 200', adminLogin.status === 200, `status ${adminLogin.status}`);
  check('GET /admin/stats (admin) → 200', (await request(base, 'GET', '/admin/stats', undefined, adminCookie ?? undefined, adminToken)).status === 200);
  check('Normal user /admin/stats → 403', (await request(base, 'GET', '/admin/stats', undefined, cookie ?? undefined, accessToken)).status === 403);

  if (orderId && adminToken) {
    const upd = await request(base, 'PATCH', `/admin/orders/${orderId}/status`, { status: 'confirmed' }, adminCookie ?? undefined, adminToken);
    check('PATCH /admin/orders/:id/status → 200', upd.status === 200, `status ${upd.status} ${JSON.stringify(upd.body)}`);
  }

  // ── Xavfsizlik / poyga / validatsiya testlari ──
  {
    // 1) Noto'g'ri ObjectId param — CastError emas, zod toza 400 qaytaradi.
    const badOrder = await request(base, 'GET', '/orders/xyz-not-an-id', undefined, cookie ?? undefined, accessToken);
    check('GET /orders/:id noto‘g‘ri ID → 400', badOrder.status === 400, `status ${badOrder.status}`);
    const badReviews = await request(base, 'GET', '/dishes/xyz-not-an-id/reviews');
    check('GET /dishes/:id/reviews noto‘g‘ri ID → 400', badReviews.status === 400, `status ${badReviews.status}`);

    // 2) NoSQL injection: ?search[$ne]=x OBYEKT holda keladi — zod string rad etadi.
    const inject = await request(base, 'GET', '/admin/users?search%5B%24ne%5D=x', undefined, adminCookie ?? undefined, adminToken);
    check('NoSQL injection (search[$ne]) → 400', inject.status === 400, `status ${inject.status}`);

    // 3) Sort injection: ?sort[$ne]=x — zod enum whitelist.
    const sortInj = await request(base, 'GET', '/dishes?sort%5B%24ne%5D=x');
    check('Sort injection (sort[$ne]) → 400', sortInj.status === 400, `status ${sortInj.status}`);

    // 4) Kategoriya o'chirish himoyasi: faol taomlar bo'lsa 400 (soft-delete, race yo'q).
    const cat0 = (catList as unknown as { _id?: string }[] | undefined)?.[0];
    if (cat0?._id) {
      const delCat = await request(base, 'DELETE', `/admin/categories/${cat0._id}`, undefined, adminCookie ?? undefined, adminToken);
      check('DELETE kategoriya (faol taomlar bilan) → 400', delCat.status === 400, `status ${delCat.status}`);
    }

    // 5) Promo poyga: usageLimit=1, ikkita PARALLEL buyurtma → atomik faqat bittasi o'tadi.
    const mkPromo = await request(base, 'POST', '/admin/promos',
      { code: 'RACETEST', type: 'fixed', value: 5000, minOrderAmount: 0, perUserLimit: 10, usageLimit: 1, isActive: true },
      adminCookie ?? undefined, adminToken);
    check('POST /admin/promos (usageLimit=1) → 201', mkPromo.status === 201, `status ${mkPromo.status} ${JSON.stringify(mkPromo.body)}`);
    if (firstDish?._id) {
      const raceBody = { items: [{ dish: firstDish._id, quantity: 1 }], deliveryType: 'pickup', paymentMethod: 'cash', promoCode: 'RACETEST' };
      const [race1, race2] = await Promise.all([
        request(base, 'POST', '/orders', raceBody, cookie ?? undefined, accessToken),
        request(base, 'POST', '/orders', raceBody, cookie ?? undefined, accessToken),
      ]);
      const winners = [race1, race2].filter((r) => r.status === 201).length;
      check('Promo poyga (parallel x2) → faqat bittasi o‘tadi', winners === 1, `statuses ${race1.status}/${race2.status}`);
    }

    // 6) Duplicate review: yetkazilgan buyurtmaga bir xil taomga ikki baho → 400.
    const { Order } = await import('../models/Order.model');
    const delivered = await Order.findOne({ status: 'delivered' }).sort({ createdAt: -1 });
    if (delivered) {
      const dishId = delivered.items[0].dish.toString();
      const rev1 = await request(base, 'POST', `/orders/${String(delivered._id)}/review`,
        { reviews: [{ dish: dishId, rating: 5 }] }, cookie ?? undefined, accessToken);
      check('POST /orders/:id/review → 201', rev1.status === 201, `status ${rev1.status} ${JSON.stringify(rev1.body)}`);
      const rev2 = await request(base, 'POST', `/orders/${String(delivered._id)}/review`,
        { reviews: [{ dish: dishId, rating: 3 }] }, cookie ?? undefined, accessToken);
      check('Duplicate review → 400', rev2.status === 400, `status ${rev2.status}`);
    } else {
      check('Duplicate review (seed delivered order topilmadi)', false);
    }

    // 7) Yetkazib berish (delivery) manzilsiz qabul qilinmaydi → 400
    if (firstDish?._id) {
      const noAddrOrder = await request(base, 'POST', '/orders',
        { items: [{ dish: firstDish._id, quantity: 1 }], deliveryType: 'delivery', paymentMethod: 'cash' },
        cookie ?? undefined, accessToken);
      check('Yetkazib berish manzilsiz buyurtma → 400', noAddrOrder.status === 400, `status ${noAddrOrder.status}`);
    }

    // 8) Admin o'zini o'zi bloklay olmaydi va o'z rolini tushira olmaydi → 400
    const adminUser = (adminLogin.body as { data: { user: { _id?: string; id?: string } } }).data?.user;
    const adminId = String(adminUser?._id ?? adminUser?.id);
    if (adminId && adminToken) {
      const selfBlock = await request(base, 'PATCH', `/admin/users/${adminId}/block`, { block: true }, adminCookie ?? undefined, adminToken);
      check('Admin o‘zini bloklash → 400', selfBlock.status === 400, `status ${selfBlock.status}`);
      const selfDemote = await request(base, 'PATCH', `/admin/users/${adminId}/role`, { role: 'user' }, adminCookie ?? undefined, adminToken);
      check('Admin o‘z rolini tushirish → 400', selfDemote.status === 400, `status ${selfDemote.status}`);
    }

    // 9) Admin taom yaratishda kategoriya slug yoki nom ko'rsatilsa ham muvaffaqiyatli saqlaydi
    if (adminToken) {
      const dishWithSlug = await request(base, 'POST', '/admin/dishes', {
        name: 'Slug Test Taom',
        description: 'Mazali test taomi tavsifi',
        price: 35000,
        category: 'palovlar',
      }, adminCookie ?? undefined, adminToken);
      check('Taom yaratish kategoriya slug bilan → 201', dishWithSlug.status === 201, `status ${dishWithSlug.status} ${JSON.stringify(dishWithSlug.body)}`);
    }

    // 10) Chat qidiruvida maxsus regex belgilari (? * [ ) bilan qidirish qulamasdan ishlaydi → 200
    if (adminToken) {
      const regexSearch = await request(base, 'GET', '/chat/conversations?search=%28%3F%5B', undefined, adminCookie ?? undefined, adminToken);
      check('Chat maxsus regex qidiruv (? * [) → 200', regexSearch.status === 200, `status ${regexSearch.status}`);
    }
  }

  // ── Ko'p qurilma sessiyalari (multi-device) — C2 regressiya testi ──
  // Ilgari har refresh global tokenVersion ni oshirardi va BOSHQA qurilmalar
  // majburan chiqarilardi. Endi har qurilma o'z sessiyasiga (sid) ega.
  {
    const dev1 = await request(base, 'POST', '/auth/login', { email: 'aziz@example.com', password: 'User123!' });
    const dev2 = await request(base, 'POST', '/auth/login', { email: 'aziz@example.com', password: 'User123!' });
    check('Ikki qurilmada login → ikkalasi cookie oladi', dev1.status === 200 && dev2.status === 200 && Boolean(dev1.cookie) && Boolean(dev2.cookie), `statuses ${dev1.status}/${dev2.status}`);

    const r1 = await request(base, 'POST', '/auth/refresh', {}, dev1.cookie ?? undefined);
    const t1 = (r1.body as { data: { accessToken: string } }).data?.accessToken;
    check('1-qurilma refresh → 200', r1.status === 200, `status ${r1.status}`);
    check('1-qurilma yangi token bilan ishlaydi → 200', Boolean(t1) && (await request(base, 'GET', '/auth/me', undefined, dev1.cookie ?? undefined, t1)).status === 200);

    const r2 = await request(base, 'POST', '/auth/refresh', {}, dev2.cookie ?? undefined);
    check('2-qurilma 1-refreshdan keyin ham 200 (cross-device logout yo‘q)', r2.status === 200, `status ${r2.status} ${JSON.stringify(r2.body)}`);

    const out1 = await request(base, 'POST', '/auth/logout', {}, dev1.cookie ?? undefined);
    check('1-qurilma logout → 200', out1.status === 200, `status ${out1.status}`);
    const r1b = await request(base, 'POST', '/auth/refresh', {}, dev1.cookie ?? undefined);
    check('logoutdan keyin 1-qurilma refresh → 401 (sessiya o‘chdi)', r1b.status === 401, `status ${r1b.status}`);
    const r2b = await request(base, 'POST', '/auth/refresh', {}, dev2.cookie ?? undefined);
    check('2-qurilma logoutdan ta’sirlanmadi → 200', r2b.status === 200, `status ${r2b.status}`);

    const fake = await request(base, 'POST', '/auth/refresh', {}, 'refreshToken=soxta-token');
    check('Soxta refresh cookie → 401', fake.status === 401, `status ${fake.status}`);
  }

  // ── Bloklash effekti: isActive + sessiyalar (ilgari hech tekshirilmagan edi) ──
  {
    const { User } = await import('../models/User.model');
    const { RefreshSession } = await import('../models/RefreshSession.model');
    const victim = await request(base, 'POST', '/auth/login', { email: 'aziz@example.com', password: 'User123!' });
    const vTok = (victim.body as { data: { accessToken: string } }).data?.accessToken;
    const target = await User.findOne({ email: 'aziz@example.com' });

    const blk = await request(base, 'PATCH', `/admin/users/${String(target!._id)}/block`, { block: true }, adminCookie ?? undefined, adminToken);
    const after = await User.findById(target!._id);
    check('Admin bloklaydi → isActive=false', blk.status === 200 && after?.isActive === false, `status ${blk.status} isActive=${after?.isActive}`);
    const vMe = await request(base, 'GET', '/auth/me', undefined, victim.cookie ?? undefined, vTok);
    check('Bloklangan userni eski access tokeni o‘ladi → 401/403', vMe.status === 401 || vMe.status === 403, `status ${vMe.status}`);
    check('Bloklangan user refresh qila olmaydi → 401', (await request(base, 'POST', '/auth/refresh', {}, victim.cookie ?? undefined)).status === 401);
    check('Bloklashda barcha refresh sessiyalari o‘chirildi', (await RefreshSession.countDocuments({ user: target!._id })) === 0);

    const unblk = await request(base, 'PATCH', `/admin/users/${String(target!._id)}/block`, { block: false }, adminCookie ?? undefined, adminToken);
    const after2 = await User.findById(target!._id);
    check('Admin blokdan chiqaradi → isActive=true', unblk.status === 200 && after2?.isActive === true, `status ${unblk.status} isActive=${after2?.isActive}`);
  }

  // Parolni tiklash oqimi — eng oxirida (tokenVersion oshadi, eski sessiyalar o'ladi).
  {
    const { signResetToken } = await import('../services/token.service');
    const { User } = await import('../models/User.model');
    const forgot = await request(base, 'POST', '/auth/forgot-password', { email: 'aziz@example.com' });
    check('POST /auth/forgot-password → 200', forgot.status === 200, `status ${forgot.status}`);
    const forgotUnknown = await request(base, 'POST', '/auth/forgot-password', { email: 'yoq-bunday@example.com' });
    check('forgot-password nomaʼlum email ham → 200 (enumeration yo‘q)', forgotUnknown.status === 200, `status ${forgotUnknown.status}`);
    const resetUser = await User.findOne({ email: 'aziz@example.com' });
    const resetToken = signResetToken(String(resetUser!._id), resetUser!.tokenVersion ?? 0);
    const badReset = await request(base, 'POST', '/auth/reset-password/soxta-token-xxxxxxxxxxxxxxxxxxxx', { password: 'NewPass123' });
    check('reset-password soxta token → 400/401', badReset.status === 400 || badReset.status === 401, `status ${badReset.status}`);
    const info = await request(base, 'GET', `/auth/reset-password/${encodeURIComponent(resetToken)}/info`);
    check('reset info → 200 + email ko‘rinadi', info.status === 200 && (info.body as { data: { email: string } }).data?.email === 'aziz@example.com', `status ${info.status} ${JSON.stringify(info.body)}`);
    const badInfo = await request(base, 'GET', '/auth/reset-password/soxta-token-xxxxxxxxxxxxxxxxxxxx/info');
    check('reset info soxta token → 400', badInfo.status === 400, `status ${badInfo.status}`);
    const goodReset = await request(base, 'POST', `/auth/reset-password/${encodeURIComponent(resetToken)}`, { password: 'NewPass123' });
    check('reset-password to‘g‘ri token → 200', goodReset.status === 200, `status ${goodReset.status} ${JSON.stringify(goodReset.body)}`);
    const reuseReset = await request(base, 'POST', `/auth/reset-password/${encodeURIComponent(resetToken)}`, { password: 'Other1234' });
    check('reset token qayta ishlatish → 400 (bir martalik)', reuseReset.status === 400, `status ${reuseReset.status}`);
    const oldLogin = await request(base, 'POST', '/auth/login', { email: 'aziz@example.com', password: 'User123!' });
    check('eski parol endi ishlamaydi → 401', oldLogin.status === 401, `status ${oldLogin.status}`);
    const newLogin = await request(base, 'POST', '/auth/login', { email: 'aziz@example.com', password: 'NewPass123' });
    check('yangi parol bilan login → 200', newLogin.status === 200, `status ${newLogin.status}`);
  }

  await new Promise<void>((r) => server.close(() => r()));
  const mongoose = await import('mongoose');
  await mongoose.disconnect();
  await mem.stop();
  console.log(`\n${'='.repeat(50)}\n✅ O'tdi: ${passed}  ❌ Yiqildi: ${failed}\n${'='.repeat(50)}`);
  process.exit(failed === 0 ? 0 : 1);
}

main().catch((e) => { console.error('❌ E2E test xatosi:', e); process.exit(1); });
