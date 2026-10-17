/**
 * Android emulyator/qurilma portlarini host kompyuterga tunnel qiladi.
 *
 * Google OAuth callback `http://localhost:5000/api/auth/google/callback`ga
 * qaytadi — emulyatorda `localhost` emulyatorning o'zini bildiradi. adb reverse
 * bu portni host'dagi lokal serverga ulaydi. Emulyator har qayta ishga
 * tushganda qayta ishga tushirish kerak: `npm run android:reverse`.
 */
const { execFileSync } = require('node:child_process');
const path = require('node:path');

/** Tunnel qilinadigan portlar (5000 — lokal backend). */
const PORTS = [5000];

function findAdb() {
  const candidates = [
    process.env.ADB,
    process.env.ANDROID_HOME ? path.join(process.env.ANDROID_HOME, 'platform-tools', 'adb.exe') : null,
    process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, 'Android', 'Sdk', 'platform-tools', 'adb.exe') : null,
    'D:\\Installs\\Android\\Sdk\\platform-tools\\adb.exe',
    'adb',
  ].filter(Boolean);

  for (const c of candidates) {
    try {
      execFileSync(c, ['version'], { stdio: 'ignore' });
      return c;
    } catch {
      /* keyingi nomzodni sinab ko'ramiz */
    }
  }
  return null;
}

const adb = findAdb();
if (!adb) {
  console.error("adb topilmadi. ANDROID_HOME (yoki ADB) muhit o'zgaruvchisini ko'rsating.");
  process.exit(1);
}

try {
  for (const port of PORTS) {
    execFileSync(adb, ['reverse', `tcp:${port}`, `tcp:${port}`], { stdio: 'inherit' });
  }
  const list = execFileSync(adb, ['reverse', '--list'], { encoding: 'utf8' });
  console.log(`Tunnel tayyor (${adb}):`);
  console.log(list.trim());
} catch (e) {
  console.error('adb reverse bajarilmadi. Emulyator/qurilma ulanganini tekshiring.');
  console.error(String(e.message || e));
  process.exit(1);
}
