# EAS Build — APK chiqarish qo‘llanmasi

## 1. Tayyorgarlik

```bash
cd boyxon-oshxona/mobile
npm install -g eas-cli
eas login   # expo.dev hisobi (bepul)
```

## 2. Preview APK (mijozlarga tarqatish uchun)

```bash
eas build --platform android --profile preview
```

- Bulutda ~10 daqiqada tayyor bo‘ladi.
- QR + yuklab olish havolasi chiqadi.
- `eas.json` da `preview.android.buildType = apk` — shuning uchun to‘g‘ridan-to‘g‘ri o‘rnatiladi.

## 3. Production (Play Market uchun)

```bash
eas build --platform all --profile production
eas submit --platform android
```

## 4. Muhim eslatmalar

- `app.json`: `package = uz.boyxon.osxona`, `version = 1.0.0`.
- Har release'da `version` oshiriladi (autoIncrement production'da yoqilgan).
- `.env`: `EXPO_PUBLIC_API_URL` — backend production URL bo‘lsin (masalan `https://api.boyxon.uz/api`).
- Rasm assetlar: `assets/icon.png`, `assets/splash.png`, `assets/adaptive-icon.png` kerak (1024x1024 / splash 1284x2778 tavsiya).
- `expo start` bilan har o‘zgarish telefonda (Expo Go) darhol ko‘rinadi.
