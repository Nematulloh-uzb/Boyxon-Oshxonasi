/**
 * Xavfsizlik tekshiruvi paytida yaratilgan vaqtinchalik test hisoblarini o'chiradi.
 * Ishlatish: npx tsx src/utils/cleanup-test-users.ts
 */
import { connectDb, disconnectDb } from '../config/db';
import { User } from '../models/User.model';

const PATTERNS = [
  /^secaudit/i,
  /^msgaudit/i,
  /^msg2-/i,
  /^leak-/i,
  /^weak-/i,
  /^weak2-/i,
  /^weak-x@/i,
];

async function main(): Promise<void> {
  await connectDb();
  const users = await User.find({}).select('email role');
  const targets = users.filter((u) => PATTERNS.some((p) => p.test(u.email)));
  if (!targets.length) {
    console.log('Tozalanadigan test hisob topilmadi.');
  } else {
    console.log(`Topildi: ${targets.length} ta test hisob`);
    for (const u of targets) console.log(`  - ${u.email} (${u.role})`);
    const ids = targets.map((u) => u._id);
    const res = await User.deleteMany({ _id: { $in: ids } });
    console.log(`✅ O'chirildi: ${res.deletedCount} ta`);
  }
  const remaining = await User.countDocuments({});
  console.log(`Bazada qolgan foydalanuvchilar: ${remaining} ta`);
  await disconnectDb();
}

main().catch((e) => {
  console.error('Xato:', e);
  process.exit(1);
});
