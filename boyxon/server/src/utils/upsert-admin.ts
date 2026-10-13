/**
 * Yagona admin hisobni ta'minlash — bitta martalik skript.
 *
 * TALAB: Admin panelga faqat `admin@gmail.com` + `Admin123!` kiradi.
 * - admin@gmail.com → role=admin, parol Admin123!
 * - Boshqa barcha adminlar → role=user (eski sessiyalar tokenVersion oshgani
 *   uchun ham bekor bo'ladi), shuning uchun ular admin panelni ko'rolmaydi.
 *
 * Ishlatish: npx tsx src/utils/upsert-admin.ts
 */
import { connectDb, disconnectDb } from '../config/db';
import { env } from '../config/env';
import { User } from '../models/User.model';

async function main(): Promise<void> {
  await connectDb();
  const email = env.ADMIN_EMAIL.toLowerCase();
  const password = env.ADMIN_PASSWORD;

  // 1) Boshqa barcha adminlarni odday foydalanuvchiga tushiramiz.
  const demoted = await User.updateMany(
    { role: 'admin', email: { $ne: email } },
    { $set: { role: 'user' }, $inc: { tokenVersion: 1 } },
  );
  console.log(`🔻 Boshqa adminlar tushirildi: ${demoted.modifiedCount} ta`);

  // 2) Asosiy adminni yaratamiz yoki yangilaymiz.
  const existing = await User.findOne({ email });
  if (existing) {
    existing.role = 'admin';
    existing.password = password; // save hook bcrypt bilan hashlaydi
    existing.emailVerified = true;
    existing.isActive = true;
    existing.tokenVersion = (existing.tokenVersion ?? 0) + 1; // eski sessiyalar o'ladi
    await existing.save();
    console.log('✅ Mavjud hisob admin qilib yangilandi:', email);
  } else {
    await User.create({
      name: 'Admin',
      email,
      password,
      role: 'admin',
      emailVerified: true,
    });
    console.log('✅ Yangi admin yaratildi:', email);
  }

  const admins = await User.find({ role: 'admin' }).select('email');
  console.log('👑 Endi faqat adminlar:', admins.map((a) => a.email).join(', ') || 'yo‘q');
  await disconnectDb();
  process.exit(0);
}

main().catch((e) => {
  console.error('❌ Xato:', e);
  process.exit(1);
});
