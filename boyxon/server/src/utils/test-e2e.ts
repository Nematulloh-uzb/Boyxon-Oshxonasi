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
