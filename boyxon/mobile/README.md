# Boyxon Oshxonasi — Android ilova (Flutter)

Sayt bilan **bir xil backend API**'ga ulanadigan mijoz ilovasi (Flutter/Dart).
APK fayl GitHub Releases'dan tarqatiladi, saytning `/download` sahifasida
QR-kod va yuklab olish tugmasi shu manzilga ishora qiladi.

## Stek

- **Flutter 3.47** (stable) + Dart 3 · faqat Android
- **dio** + **cookie_jar** (refresh token — serverning httpOnly cookie dizayni
  bilan bir xil, 401 da single-flight avtomatik yangilash)
- **provider** (holat), **socket_io_client** (real-time: `order:status`,
  `notification:new`), **cached_network_image**, **shared_preferences**
- **gen-l10n** (ARB) — uz / ru / en
- Shriftlar: Epilogue + Inter (sayt dizayni bilan bir xil), `assets/fonts/`

## Tuzilma

```
lib/
├── main.dart            # ApiClient.init + runApp
├── app.dart             # MaterialApp, provider'lar, socket ulash, snackbarlar
├── core/                # env, api_client, theme (DESIGN.md tokenlari), formatlar
├── models/              # User, Dish, Order, ... (web types/index.ts bilan bir xil)
├── services/            # auth, cart, settings, socket
├── l10n/                # app_uz/ru/en.arb + generatsiya (gen-l10n)
├── widgets/             # DishCard, QuantityStepper, holat ko'rinishlari, formalar
└── screens/             # splash, shell, auth, home, cart, orders, settings
```

## Lokal ishga tushirish

Android Studio kerak emas — VS Code + emulyator yetarli.

```powershell
# 1) Portativ toolchain (har yangi terminalda)
. D:\Installs\Android\env.ps1

# 2) Server ishda bo'lsin (boyxon/server, npm run dev:local)

# 3) Emulyatorda ishga tushirish
cd boyxon\mobile
flutter run        # emulyatordan hostga default: http://10.0.2.2:5000/api
```

> Emulyator `10.0.2.2` → kompyuteringizning `localhost`'i. Haqiqiy qurilmada
> sinash uchun kompyuter LAN IP'sini bering:
> `flutter run --dart-define=API_URL=http://192.168.x.x:5000/api`
>
> Debug build'lar lokal `http://` ga ruxsat beradi
> (`android/app/src/debug/AndroidManifest.xml`); release'da faqat https ishlaydi.

## Release APK yig'ish

```powershell
cd boyxon\mobile
flutter build apk --release --dart-define=API_URL=https://<server>/api
```

- **`API_URL`** — build vaqtida qotib qoladi (dart-define). Deploy bo'lgach
  qiymat: `https://boyxon-server.onrender.com/api` (render.yaml'dagi nom).
- Natija: `build\app\outputs\flutter-apk\app-release.apk` (~20 MB, barcha ABI).
- Imzolash: `android/key.properties` (git'ga **tushmaydi**) +
  `D:\Installs\Android\boyxon-keys\boyxon-release.jks`.

> ⚠️ **Kalitni yo'qotsangiz** Google Play/sayt orqali yangilanish chiqara
> olmaysiz (boshqa imzo = yangi ilova sifatida o'rnatiladi). Zaxira nusxasini
> xavfsiz joyda saqlang. Parol: `D:\Installs\Android\boyxon-keys\INFO.txt`.

## Yangi versiya chiqarish (sayt QR → APK)

1. `pubspec.yaml` da `version: 1.0.0+2` kabi oshiring.
2. Release APK yig'ing (yuqoriga qarang).
3. GitHub Release yarating va APK'ni **aniq `boyxon.apk` nomi bilan** yuklang:

   `https://github.com/Nematulloh-uzb/Boyxon-Oshxonasi/releases/latest/download/boyxon.apk`

   Sayt `DownloadPage.tsx` default'i shu manzil (yoki `VITE_APK_URL` bilan
   almashtiriladi). Asset nomi o'zgarsa QR/tugma ishlamaydi!

## Ikonka (launcher)

`assets/icon/` ichidagi PNG'lardan generatsiya qilinadi:

```powershell
dart run flutter_launcher_icons
```

## Tarjimalar

Matn qo'shsangiz: `lib/l10n/app_uz.arb` (shablon) + `app_ru.arb` + `app_en.arb`,
so'ng:

```powershell
flutter gen-l10n
```

Kalitlar generatsiyada **o'z holida** qoladi (`auth_login` → `l.auth_login`).

## Build muammolari (Windows)

- `Could not close incremental caches ...` xatosi — Kotlin inkremental keshi
  Windows'da fayl bloklanishi tufayli ba'zan yiqiladi. Shu sabab
  `android/gradle.properties` da `kotlin.incremental=false` qo'yilgan —
  o'chirmang. Yana takrorlansa: `flutter clean` + `android\gradlew --stop`,
  so'ng qayta build qiling.
- `The contents of the immutable workspace ... have been modified` xatosi —
  Gradle'ning global transform keshi buzilgan (odatda build jarayoni zo'rlab
  to'xtatilganda). Yechim: `%USERPROFILE%\.gradle\caches\<gradle-versiya>\transforms`
  papkasini o'chirib, qayta build qiling.

## Eslatmalar

- Google bilan kirish (OAuth) ilovada yo'q — email/parol kiradi.
- Push (FCM) hali yo'q — real-time socket + ilova ichidagi bildirishnomalar bor.
- To'lov (Payme/Click/Uzum) sayt kabi hozircha faqat qayd etiladi.
