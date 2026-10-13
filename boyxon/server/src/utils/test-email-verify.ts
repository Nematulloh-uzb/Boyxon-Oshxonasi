/**
 * Email tasdiqlash oqimini uchdan-uchiga tekshirish.
 * Tasdiqlash tokenini to'g'ridan-to'g'ri yaratib, HTTP endpoint orqali sinaydi.
 *
 * Ishlatish: npx tsx src/utils/test-email-verify.ts
 */
import { connectDb, disconnectDb } from '../config/db';
import { User } from '../models/User.model';
import { signEmailVerifyToken } from '../services/token.service';

const BASE = 'http://localhost:5000/api';
let pass = 0;
let fail = 0;

function check(name: string, cond: boolean, extra = ''): void {
  if (cond) { pass++; console.log(`  ✅ ${name}`); }
  else { fail++; console.log(`  ❌ ${name} ${extra}`); }
}

async function call(method: string, path: string, body?: unknown): Promise<{ status: number; body: any }> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  let parsed: unknown = null;
  try { parsed = await res.json(); } catch { /* bo'sh javob */ }
  return { status: res.status, body: parsed };
}

async function main(): Promise<void> {
  await connectDb();
  console.log('🧪 Email tasdiqlash oqimi tekshirilmoqda...\n');

  const email = `verifytest${Date.now()}@example.com`;
  const reg = await call('POST', '/auth/register', {
    name: 'Verify Test',
    email,
    password: 'AuditPass123',
  });
  check('Ro‘yxatdan o‘tish → 201', reg.status === 201, `status ${reg.status} ${JSON.stringify(reg.body)}`);

  const user = await User.findOne({ email });
  check('emailVerified boshlang‘ich = false', user?.emailVerified === false);

  // Tasdiqlash tokenini yaratamiz (real hayotda emailga yuboriladi).
  const token = signEmailVerifyToken(String(user!._id), user!.tokenVersion ?? 0);

  console.log('\n  — Noto‘g‘ri token bilan —');
  const bad = await call('POST', '/auth/verify-email/bu-soxta-token-xxxxxxxxxxxxxxxxxxxx');
  check('Soxta token → 400', bad.status === 400, `status ${bad.status}`);

  console.log('\n  — To‘g‘ri token bilan —');
  const good = await call('POST', `/auth/verify-email/${encodeURIComponent(token)}`);
  check('To‘g‘ri token → 200', good.status === 200, `status ${good.status} ${JSON.stringify(good.body)}`);

  const after = await User.findOne({ email });
  check('emailVerified endi true', after?.emailVerified === true);
  check('tokenVersion oshdi (token bir martalik)', (after?.tokenVersion ?? 0) > (user?.tokenVersion ?? 0));

  console.log('\n  — O‘sha token QAYTA ishlatilsa —');
  const reuse = await call('POST', `/auth/verify-email/${encodeURIComponent(token)}`);
  // Idempotent: hisob allaqachon tasdiqlangan, holat o'zgarmaydi.
  check(
    'Qayta ishlatish → 200 "allaqachon tasdiqlangan" (holat o‘zgarmaydi)',
    reuse.status === 200 && reuse.body?.data?.alreadyVerified === true,
    `status ${reuse.status} ${JSON.stringify(reuse.body)}`,
  );
  const afterReuse = await User.findOne({ email });
  check('Qayta ishlatish tokenVersion ni o‘zgartirmadi', (afterReuse?.tokenVersion ?? 0) === (after?.tokenVersion ?? -1));

  console.log('\n  — Tasdiqlangandan keyin login —');
  const login = await call('POST', '/auth/login', { email, password: 'AuditPass123' });
  check('Login → 200', login.status === 200, `status ${login.status} ${JSON.stringify(login.body)}`);
  check('Javobda emailVerified=true', login.body?.data?.user?.emailVerified === true);

  console.log('\n  — Takroriy ro‘yxatdan o‘tish —');
  const dup = await call('POST', '/auth/register', { name: 'Dup', email, password: 'AuditPass123' });
  check('Bir xil email → 409', dup.status === 409, `status ${dup.status}`);

  console.log('\n  — Qayta yuborish (rate limit ostida) —');
  const resend = await call('POST', '/auth/resend-verification', { email });
  check('resend-verification → 200', resend.status === 200, `status ${resend.status}`);
  const resendUnknown = await call('POST', '/auth/resend-verification', { email: 'yoq-bunday@example.com' });
  check('Mavjud bo‘lmagan email ham 200 (enumeration yo‘q)', resendUnknown.status === 200, `status ${resendUnknown.status}`);

  // Tozalash
  await User.deleteOne({ email });

  console.log(`\n${'='.repeat(50)}`);
  console.log(`✅ O'tdi: ${pass}  ❌ Yiqildi: ${fail}`);
  console.log('='.repeat(50));
  await disconnectDb();
  process.exit(fail ? 1 : 0);
}

main().catch((e) => {
  console.error('Xato:', e);
  process.exit(1);
});
