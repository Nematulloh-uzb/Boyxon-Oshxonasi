import http from 'http';
import { Server } from 'socket.io';
import { createApp } from './app';
import { connectDb } from './config/db';
import { env } from './config/env';
import { setIo } from './socket';
import { verifyAccessToken } from './services/token.service';
import { User } from './models/User.model';

async function main(): Promise<void> {
  await connectDb();
  const app = createApp();
  const server = http.createServer(app);

  const io = new Server(server, {
    cors: { origin: env.CLIENT_URL.split(','), credentials: true },
  });
  setIo(io);

  // Socket ham xuddi HTTP kabi qat'iy tekshiriladi: token imzosi + hisob holati +
  // tokenVersion. Aks holda bloklangan foydalanuvchi real-time chatni davom ettirardi.
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) return next(new Error('Token kerak'));
    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch {
      return next(new Error('Token yaroqsiz'));
    }
    void User.findById(decoded.id)
      .select('role isActive tokenVersion')
      .then((user) => {
        if (!user) return next(new Error('Foydalanuvchi topilmadi'));
        if (!user.isActive) return next(new Error('Hisob bloklangan'));
        if ((user.tokenVersion ?? 0) !== decoded.ver) return next(new Error('Sessiya bekor qilingan'));
        socket.data.userId = decoded.id;
        socket.data.role = user.role;
        next();
      })
      .catch(() => next(new Error('Autentifikatsiya xatosi')));
  });

  io.on('connection', (socket) => {
    const userId = socket.data.userId as string;
    const role = socket.data.role as 'user' | 'admin';
    socket.join(`user:${userId}`);
    if (role === 'admin') socket.join('admin');

    // "Yozmoqda" indikatori — raqibga uzatamiz (DB siz, faqat signal).
    socket.on('chat:typing', (payload: { to?: string }) => {
      if (role === 'user') {
        socket.to('admin').emit('chat:typing', { from: userId, role });
      } else if (payload?.to) {
        socket.to(`user:${payload.to}`).emit('chat:typing', { role: 'admin' });
      }
    });

    socket.on('disconnect', () => undefined);
  });

  server.listen(env.PORT, () => {
    console.log(`🚀 Boyxon API: http://localhost:${env.PORT}`);
  });
}

main().catch((e) => {
  console.error('❌ Server ishga tushmadi:', e);
  process.exit(1);
});
