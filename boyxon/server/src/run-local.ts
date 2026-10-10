/**
 * Lokal ishga tushiruvchi — Atlas IP whitelist kutmasdan backend'ni
 * darhol ishga tushiradi. MongoDB'ni xotirada (mongodb-memory-server)
 * ko'taradi, keyin asosiy serverni shu URI bilan ishga tushiradi.
 *
 * Ishlatish:  npm run dev:local
 *
 * ⚠ Diqqat: ma'lumotlar faqat xotirada saqlanadi — server to'xtagach
 * yo'qoladi. Doimiy ma'lumot uchun Atlas whitelist qiling (README ga qarang)
 * yoki lokal `mongod` o'rnating va MONGODB_URI ni to'g'rilang.
 */
import { MongoMemoryServer } from 'mongodb-memory-server';

async function main(): Promise<void> {
  console.log('🧠 Lokal MongoDB (xotira) ishga tushmoqda...');
  const mem = await MongoMemoryServer.create();
  const uri = mem.getUri('boyxon');
  process.env.MONGODB_URI = uri;
  console.log(`✅ Lokal MongoDB tayyor: ${uri}`);

  // DB ga ulanish + demo ma'lumotlarni yozish (admin, 24 taom, promo...).
  const { connectDb } = await import('./config/db');
  const { runSeed } = await import('./utils/seed');
  await connectDb();
  await runSeed();

  // index.ts import qilinganda env.ts process.env.MONGODB_URI ni o'qiydi —
  // URI yuqorida o'rnatilgani uchun server shu lokal DB ga ulanadi.
  await import('./index');

  // Toza yopilish
  const shutdown = async (): Promise<void> => {
    console.log("\n🛑 To'xtatilmoqda...");
    await mem.stop();
    process.exit(0);
  };
  process.on('SIGINT', () => void shutdown());
  process.on('SIGTERM', () => void shutdown());
}

main().catch((e) => {
  console.error('❌ Lokal ishga tushirish xatosi:', e);
  process.exit(1);
});
