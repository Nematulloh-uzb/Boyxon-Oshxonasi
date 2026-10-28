import http from 'http';
import { createApp } from './app';
import { connectDb } from './config/db';
import { env } from './config/env';
import { attachRealtimeServer } from './realtime-node';

async function main(): Promise<void> {
  await connectDb();
  const app = createApp();
  const server = http.createServer(app);

  // Socket.IO o'rniga native WebSocket (`/ws`) — Workers'dagi protokol bilan bir xil.
  attachRealtimeServer(server);

  server.listen(env.PORT, () => {
    console.log(`✅ Boyxon API: http://localhost:${env.PORT}`);
  });
}

main().catch((e) => {
  console.error('❌ Server ishga tushmadi:', e);
  process.exit(1);
});
