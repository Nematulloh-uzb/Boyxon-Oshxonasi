# Boyxon Oshxonasi — Mobil ilova (React Native / Expo)

Google Stitch dizayni asosida **1:1** qurilgan React Native ilova. Backend sifatida
`boyxon/server` REST API ishlatiladi (web sayt bilan aynan bir xil API).

## Texnologiyalar

- **Expo SDK 58** / React Native 0.88 / React 19 (React Compiler yoqilgan)
- **expo-router** — fayl-asosli routing (typed routes)
- **TanStack Query** — server holati; **Zustand** — auth/savat/toast
- **expo-secure-store** — tokenlar; **expo-local-authentication** — biometrik qulf
- i18n: o'zbekcha (asosiy), ruscha, inglizcha — `src/locales/*.json`
- Material-3 tokenlar (`src/theme/tokens.ts`) — Stitch `tailwind config`dan aynan olingan

## Ishga tushirish

1. Bog'liqliklar: `npm install`
2. Backend (`boyxon/server`): `npm run dev:local` — lokal xotira MongoDB + seed
3. Ilova:
   - `npm run start` — QR / Expo Go
   - `npm run android` — Android emulyator avtomatik ochiladi
   - Google OAuth sinovi uchun: `npm run android:reverse` (tcp:5000 tunnel, pastga qarang)

## Konfiguratsiya

`EXPO_PUBLIC_API_URL` — backend manzili (`mobile/.env`, namuna — `.env.example`):

| Muhit            | Qiymat                                   |
| ---------------- | ---------------------------------------- |
| Emulyator (lokal)| `http://10.0.2.2:5000/api`               |
| Prod (Render)    | `https://boyxon-server.onrender.com/api` |

## Struktura

```
src/
  app/            # ekranlar (expo-router)
    (tabs)/       # Asosiy, Savat, Sozlamalar
    kirish.tsx    # Kirish / Ro'yxatdan o'tish
    taom/[slug]   # Taom detali
    buyurtmalar   # Buyurtmalar ro'yxati
    buyurtma/[id] # Buyurtma kuzatuvi
    bildirishnomalar
    admin/        # Admin boshqaruv paneli (05 dizayn)
  api/            # REST klient (x-client: mobile, 401 single-flight refresh)
  components/     # UI kutubxona (Button, Input, AppBar, OrderStatusChip, ...)
  store/          # auth, cart, toast (Zustand)
  theme/          # Material-3 tokenlar + ThemeProvider (light/dark)
  lib/            # format, orderStatus, initials, tokenStorage, constants
  locales/        # uz / ru / en
```

## Android APK (GitHub Actions)

`.github/workflows/boyxon-apk.yml` — **workflow_dispatch** orqali ishga tushiriladi:

- `boyxon.apk` nomli artifact yig'iladi;
- `v*` teg push qilinsa — GitHub Release'ga `boyxon.apk` biriktiriladi.

Release imzolash uchun repository **secrets**:

| Secret | Izoh |
| ------ | ---- |
| `ANDROID_KEYSTORE_BASE64` | Keystore faylining base64 nusxasi |
| `ANDROID_KEYSTORE_PASSWORD` | Keystore paroli |
| `ANDROID_KEY_ALIAS` | Kalit aliasi |
| `ANDROID_KEY_PASSWORD` | Kalit paroli |

Agar keystore sir bo'lmasa — APK debug imzo bilan yig'iladi (faqat test uchun).
⚠️ **Keystore faylni hech qachon repoga qo'shmang** (lokal baza: `D:\Installs\Android\boyxon-keys\`).

### Lokal APK build (Windows)

⚠️ Windows'da yo'l uzunligi cheklovi (MAX_PATH 260) NDK/CMake build'ni buzadi:
`D:\Loyihalar\Boyxon oshxonasi\...` (bo'sh joy + uzun yo'l) sababli
`react-native-worklets` CMake bosqichida `ninja: error: mkdir(...): No such file or directory`
xatosi chiqadi. `subst`/`junction` **yordam bermaydi** (Gradle yo'lni canonicalize qilib,
asl uzun yo'lga qaytaradi). Ishlaydigan usul — loyihani **qisqa yo'lga nusxalash**:

```powershell
$src = "D:\Loyihalar\Boyxon oshxonasi\boyxon\mobile"
$dst = "C:\Users\user\bx"   # qisqa yo'l — CMake'ning barcha ichki fayllariga 260 belgi yetadi

robocopy $src $dst /E /MT:16 /XD "$src\node_modules" "$src\android" "$src\.expo" "$src\dist"
robocopy "$src\node_modules" "$dst\node_modules" /E /MT:32 /XD ".cxx" /NFL /NDL /NJH /NJS

cd $dst
node .\node_modules\expo\bin\cli prebuild --platform android --clean
Copy-Item "D:\Installs\Android\boyxon-keys\boyxon-release.jks" "android\app\release.keystore"
# build.gradle'ga release signing qo'shiladi: signingConfigs { release {...} } +
# release buildType'da `signingConfig signingConfigs.release` (CI'dagi python patch bilan bir xil)

cd "$dst\android"
$env:JAVA_HOME = "D:\Installs\Android\jdk\jdk-17.0.20.1+1"
$env:ANDROID_HOME = "D:\Installs\Android\sdk"
.\gradlew.bat assembleRelease --no-daemon -x lint -x test
# Natija: C:\Users\user\bx\android\app\build\outputs\apk\release\app-release.apk
```

CI (ubuntu-latest) bu muammodan xoli — workflow oddiy yo'l bilan ishlaydi.

## Google bilan kirish (Android emulyator + lokal backend)

Lokal serverda `GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback`
(GCP Console'da ro'yxatdan o'tgan; Google http uchun faqat `localhost`ga ruxsat beradi,
`10.0.2.2` kabi manzillarga yo'q). Emulyator brauzeri `localhost`ni **emulyatorning
o'ziga** yo'naltiradi, shuning uchun host kompyuter portini emulyatorga tunnel qilib
berish kerak:

```powershell
npm run android:reverse
# yoki qo'lda:
& "D:\Installs\Android\Sdk\platform-tools\adb.exe" reverse tcp:5000 tcp:5000
```

- Emulyator har qayta ishga tushganda takrorlanadi (doimiy emas).
- Tekshirish: `adb reverse --list` ro'yxatida `tcp:5000 tcp:5000` bo'lishi kerak.
- Aks holda Google'dan qaytishda brauzerda `ERR_CONNECTION_REFUSED` (localhost:5000) chiqadi.
- Google OAuth `boyxon://auth/...` deep-link ishlatadi — **Expo Go'da emas**, dev-build/APK'da ishlaydi.

## Tekshirish

```powershell
# Typecheck (npx o'rniga node orqali — Windows script cheklovi):
node ./node_modules/typescript/lib/tsc.js --noEmit
```

## Buyurtma holati zanjiri

`pending → confirmed → packing → handed_to_taxi → delivered` (+ `cancelled`).
Status ranglari/ikonkalari `src/lib/orderStatus.ts`da yagona manbadan olinadi
(savat, buyurtmalar, kuzatuv, admin — hammasi shu fayldan foydalanadi).
