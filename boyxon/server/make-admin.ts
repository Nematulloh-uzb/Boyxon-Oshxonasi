import { connectDb, disconnectDb } from './src/config/db';
import { User } from './src/models/User.model';

// node_modules topilishi uchun server papkasidan ishga tushiring:
//   cd boyxon/server
//   npx tsx make-admin.ts "nmatullohmansurov@gmail.com" "YangiParol123!"
// 2-argument (parol) berilmasa — eski parol saqlanadi, faqat rol admin qilinadi.
async function main(): Promise<void> {
  const email = (process.argv[2] ?? '').trim().toLowerCase();
  const newPassword = (process.argv[3] ?? '').trim();
  if (!email || !email.includes('@')) {
    console.error('Email bering: npx tsx make-admin.ts "email" ["yangi-parol"]');
    process.exit(1);
  }
  await connectDb();
  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.error(`Topilmadi: ${email} — avval saytda ro'yxatdan o'ting (/auth).`);
      process.exit(2);
    }
    user.role = 'admin';
    user.isActive = true;
    if (newPassword) {
      if (newPassword.length < 6) {
        console.error('Parol kamida 6 belgidan iborat bo‘lsin.');
        process.exit(1);
      }
      user.password = newPassword; // pre('save') avtomatik hash qiladi
    }
    await user.save();
    console.log(`✅ ${email} → ADMIN qilindi${newPassword ? ' + parol yangilandi' : ' (parol o‘zgarmadi)'}.`);
    console.log('Endi /auth da kiring → avtomatik /admin ga o‘tasiz.');
  } finally {
    await disconnectDb();
  }
}

main().catch((e) => {
  console.error('❌ Xato:', e?.message ?? e);
  process.exit(1);
});
