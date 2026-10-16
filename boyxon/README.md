# Boyxon Oshxonasi — Full-Stack Food Delivery Platform

O'zbek milliy taomlarini yetkazib berish platformasi: React 18 + Vite + TypeScript
frontend, Express + MongoDB backend, Socket.IO real-time, Web Push, Google OAuth,
Cloudinary rasmlar, to'liq admin panel.

## Dizayn tizimi

- Fon: `#FFF8F0` (cream) · Matn: `#2C2C2C` · Chiziq: `#ECE5DC`
- Primary: `#E67E22` → hover `#D35400` · Success `#27AE60` · Danger `#E74C3C`
- Shriftlar: Epilogue (sarlavha) + Inter (matn) — Google Fonts
- Radius: karta 20px, tugma full · Mobile-first: 375 / 768 / 1024 / 1440
- Rasm yo'q bo'lsa → `DishPlaceholder` (hech qachon avto-generatsiya qilinmaydi)

## Tez boshlash (local)

Backend MongoDB'ga ulanishi kerak. Ikki yo'l bor:

**A) `dev:local` — hoziroq ishlaydi (Atlas whitelist shart emas).**
MongoDB'ni xotirada ko'taradi, demo ma'lumotlarni avtomatik yozadi.
Ishlab bo'lgach ma'lumotlar tozalanadi (faqat lokal sinov uchun):

```bash
# 1) Frontend env (backend uchun .env shart emas)
cp boyxon/client/.env.example boyxon/client/.env

# 2) Backend — xotira MongoDB + avtomatik seed
cd boyxon/server
npm install
npm run dev:local    # http://localhost:5000 (admin + 24 taom avtomatik)

# 3) Frontend (yangi terminal)
cd boyxon/client
npm install
npm run dev          # http://localhost:5173
```

**B) `dev` — MongoDB Atlas (doimiy ma'lumot).**
Atlas IP whitelist qilingandan keyin:

```bash
cp boyxon/server/.env.example boyxon/server/.env
# .env ichida MONGODB_URI ni to'ldiring

cd boyxon/server
npm install
npm run seed         # admin + demo + 8 kategoriya + 24 taom + 3 promo + 5 buyurtma
npm run dev          # http://localhost:5000

cd boyxon/client
npm install
npm run dev          # http://localhost:5173
```

Demo loginlar (seed dan keyin):

| Rol | Email | Parol |
|-----|-------|-------|
| Admin | `.env` dagi `ADMIN_EMAIL` | `.env` dagi `ADMIN_PASSWORD` |
| Demo | aziz@example.com | `.env` dagi `DEMO_PASSWORD` (default: `User123!`) |

> **Xavfsizlik:** admin paroli endi kodda yoki README'da saqlanmaydi — faqat `.env` da.
> `npm run seed` admin hisobini `ADMIN_EMAIL` / `ADMIN_PASSWORD` qiymatlari bilan yaratadi.
> Production'da `ADMIN_PASSWORD` kamida 12 belgi bo'lishi shart, aks holda server
> ishga tushmaydi. Batafsil: [SECURITY.md](SECURITY.md).

Promo kodlar: `BOYXON20` (20% ≤30 000, min 100 000) · `WELCOME10` (10%) ·
`FREEDEL` (8 000 chegirma, min 50 000).

> **MongoDB Atlas IP whitelist:** `npm run dev` (Atlas) paytida
> `MongooseServerSelectionError: ... from an IP that isn't whitelisted`
> chiqsa — hozirgi IP ruxsat etilmagan. Atlas → Network Access → Add IP
> Address → Allow Access from Anywhere (0.0.0.0/0) yoki o'z IP manzilingizni
> qo'shing. Shoshilsangiz — `npm run dev:local` ishlatishingiz mumkin
> (whitelist shart emas).

## Test (lokal MongoDB kerak emas)

`npm test` buyrug'i **mongodb-memory-server** bilan haqiqiy HTTP so'rovlar
orqali butun backend'ni tekshiradi (Atlas whitelist shart emas):

```bash
cd boyxon/server
npm test    # 59 ta tekshiruv: auth, ko'p qurilma sessiyalari, avatar, dishes,
            # orders, admin, 403, injection, poyga, parol tiklash
```

Natija: `✅ O'tdi: 59  ❌ Yiqildi: 0`

## Muhit o'zgaruvchilari

`boyxon/server/.env.example` va `boyxon/client/.env.example` ga qarang.
VAPID kalitlar:

```bash
npx web-push generate-vapid-keys
```

Google OAuth: [Google Cloud Console](https://console.cloud.google.com) →
Credentials → OAuth client (Web) → redirect:
`http://localhost:5000/api/auth/google/callback`.

## API qisqacha

- `POST /api/auth/register|login|logout|refresh` · `GET /api/auth/me`
- `GET /api/auth/google` → Google · `GET /api/auth/google/callback`
- `GET /api/categories` · `GET /api/dishes?category=&search=&page=` ·
  `GET /api/dishes/featured` · `GET /api/dishes/:slug`
- `POST /api/orders` (auth) · `GET /api/orders/:id` · `PATCH /api/orders/:id/cancel`
- `POST /api/promos/validate` · `GET /api/notifications` (auth)
- `GET /api/push/vapid-public-key` · `POST /api/push/subscribe|unsubscribe`
- `GET /api/admin/stats` + dishes/categories/orders/users/promos/push CRUD (admin)

Socket.IO: client login dan keyin ulanadi.
`user:<id>` va `admin` xonalari. Hodisalar: `order:status`, `order:updated`.

## Deploy

- Frontend → Vercel: root `boyxon/client`, build `npm run build`, output `dist`,
  env `VITE_API_URL`, `VITE_SOCKET_URL`, `VITE_VAPID_PUBLIC_KEY`.
- Backend → Railway/Render: root `boyxon/server`, build `npm run build`,
  start `npm start`, env — `.env.example` dagi barchasi.
- DB → MongoDB Atlas · Rasmlar → Cloudinary.

## Test oqimlari

a) Google/kirish → home → savat → checkout → admin da buyurtma ko'rinadi.
b) Admin status o'zgartiradi → user da real-time toast + push.
c) R asmsiz taom → placeholder. d) Rasmli taom → Cloudinary img.
e) Notification prefs → push hurmat qiladi. f) Til uz/ru/en → matn yangilanadi.

## Tuzilma

```
boyxon-oshxonasi/        # repo ildizi
├── boyxon/
│   ├── client/          # React 18 + Vite + TS + Tailwind + shadcn
│   ├── server/          # Express + TS + Mongoose + Socket.IO
│   └── README.md        # shu fayl
└── docker-compose.yml   # lokal Mongo (repo ildizida)
```

> `docker-compose.yml` — Atlas o'rniga lokal MongoDB ishlatmoqchi bo'lsangiz:
> `docker compose up -d`, so'ng `server/.env` da
> `MONGODB_URI=mongodb://localhost:27017/boyxon`.
