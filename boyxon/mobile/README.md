# Boyxon Oshxonasi — mobil ilova (Flutter)

Sayt bilan **bir xil backend** (`boyxon/server`) va **bir xil dizayn tili** asosida qurilgan
Android ilova. 10 ta Stitch maketdagi ("birga bir") ekranlar Flutter'da qayta yaratilgan.

## Asosiy imkoniyatlar

- **Menyu**: bo'limlar, qidiruv, saralash, mashhur taomlar, savatga qo'shish, sevimlilar
- **Savat / Buyurtma**: yetkazish yoki olib ketish, manzil tanlash, promo kod, 4 xil to'lov
  usuli (Payme / Click / Uzum / Naqd), buyurtma izohi
- **Buyurtmalar**: jonli status kuzatuvi (tayyorlanmoqda → taksida → yetkazildi),
  bekor qilish, baholash
- **Bildirishnomalar**: o'qilgan/o'qilmagan, hammasini o'qish
- **Sozlamalar**: profil, manzillar, til (uz/ru/en), tungi rejim, push
- **Admin panel** (faqat admin hisobida): KPI ko'rsatkichlar, jonli buyurtmalar,
  status filtri, qabul qilish / tayyorlash / bekor qilish amallari

## Ishga tushirish

```bash
flutter pub get
flutter run                                   # production server bilan
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:5000   # lokal server bilan
```

## Release APK

```bash
flutter build apk --release
# natija: build/app/outputs/flutter-apk/app-release.apk
```

Imzolash `android/key.properties` fayli orqali (gitga kirmaydi). Keystore va parolni
**yo'qotmaslik kerak** — yangi versiyalarni o'sha keystore bilan imzolash shart.

## Tuzilma

```
lib/
  core/       api (dio + cookie), i18n, session, config, utils
  data/       modellar (Dish, Order, User...) + servislar (API chaqiruvlari)
  features/   auth, splash, shell, home (menyu), cart, orders, notifications, settings, admin
  theme/      AppPalette (light/dark tokenlar), AppText, AppTheme
assets/locales/  uz.json, ru.json, en.json  (saytdagi kalitlar + app.* qo'shimchalari)
```

## Muhim eslatmalar

- Access token xotirada, refresh token cookie'da saqlanadi (sayt bilan bir xil oqim);
  ilova qayta ochilganda `POST /api/auth/refresh` orqali sessiya tiklanadi.
- Yakuniy narx (yetkazish, promo, chegirma) har doim **serverda** qayta hisoblanadi:
  yetkazish 12 000 so'm, 150 000 so'mdan bepul.
- Til matnlari `context.tr('kalit')` orqali olinadi; yangi matn qo'shilsa uchala
  JSON faylga ham qo'shishni unutmang.
