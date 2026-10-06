import { appYarat } from './app';
import { dbUlanish } from './config/db';
import { env, envTekshir } from './config/env';

async function boshlash(): Promise<void> {
  envTekshir();
  await dbUlanish();
  const app = appYarat();
  app.listen(env.PORT, () => {
    console.log(`Backend ishga tushdi: http://localhost:${env.PORT}`);
  });
}

boshlash().catch((xato) => {
  console.error('Ishga tushmadi:', xato);
  process.exit(1);
});
