# Boyxon Oshxonasi — Expo + MongoDB

O'zbek taomlarini yetkazib berish mobil ilovasi. 100% o'zbek (lotin), Expo SDK 51, Expo Router v3, NativeWind v4, Zustand, React Query, MongoDB.

## Tez boshlash

```bash
# 1) Backend
cd boyxon-oshxona/backend
cp .env.example .env
npm install
npm run dev

# Seed (MongoDB bo'sh bo'lsa)
npm run seed

# 2) Mobile (Expo Go bilan test)
cd ../mobile
npm install
npx expo start -c
```

Telefonda `Expo Go` ni ochib QR kodni skanerlang. Demo: `+998 90 123 45 67 / boyxon123`.

### Telefonda API manzilini sozlash

Expo Go ishlayotgan jismoniy telefonda `localhost` telefonning o'zini anglatadi. `mobile/.env` faylini yarating va kompyuteringizning LAN IP manzilini kiriting:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.10:4000/api
```

`192.168.1.10` o'rniga kompyuteringizning haqiqiy IPv4 manzilini yozing; telefon va kompyuter bir Wi-Fi tarmog'ida bo'lishi, firewall esa `4000` portiga ulanishga ruxsat berishi kerak. So'ng `mobile` papkasida `npx expo start -c` buyrug'ini qayta ishga tushiring. Android emulyator `10.0.2.2`, iOS simulator esa `localhost` manzilidan standart tarzda foydalanadi.

## API

- `POST /api/auth/royxat` — ism, telefon, parol → OTP yuboriladi
- `POST /api/auth/kirish` — telefon + parol → access + refresh
- `POST /api/auth/otp-sorash` — telefon + maqsad
- `POST /api/auth/otp-tasdiq` — telefon + kod + maqsad → token
- `POST /api/auth/parol-tiklash` — telefon + kod + yangiParol
- `GET /api/kategoriyalar`, `GET /api/mahsulotlar`, `GET /api/mahsulotlar/:id`
- `POST /api/promo/validate` — kod + summa → chegirma
- `POST /api/orders`, `GET /api/orders` — buyurtmalar
- `GET /api/user/profil`, `PATCH /api/user/profil`
- `GET /salomatlik` — server holati

## APK chiqarish (EAS)

```bash
npm install -g eas-cli
eas login
eas build --platform android --profile preview
```

## Bosqichlar holati

- ✅ 1: Expo + backend sozlamalari
- ✅ 2: MongoDB 7 model + seed (6 kat, 10 mahsulot, 2 promo, 1 demo)
- ✅ 3: Auth (JWT, OTP, Eskiz SMS, Telegram)
- ✅ 4: Katalog + Promo + Buyurtma + User API
- ✅ 5: UI atomlar (Tugma, Maydon, Skelet, Toast, BoshHolat, Badge)
- ✅ 6: Auth ekranlar (kirish, ro'yxat, OTP tiklash)
- ✅ 7: Asosiy (qidiruv, promo BOYXON20, kategoriya, mashhur)
- ✅ 8: Savatcha (stepper, promo, avtomatik hisob)
- ✅ 9: Sozlamalar (til uz/ru/en, Switch, clipboard)
- ✅ 10: Navigatsiya (tabs + stack + 404)
- ✅ 11: Animatsiyalar (Reanimated spring + Haptics)
- ✅ 12: i18n to'liq integratsiya (useTil hook + sinxron)
- ✅ 13: Test + EAS Build qo'llanma (11/11 test o'tdi)

15 xato tuzatishning barchasi kodda izoh bilan belgilangan (XATO 1-15).