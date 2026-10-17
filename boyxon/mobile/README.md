# Boyxon Oshxonasi — Android ilova (Capacitor — sayt 1:1)

Saytning o'zi APK ichida ishlaydi — **100% 1:1 kafolat**. Alohida Flutter
ilovasi (`boyxon/mobile/`) ham bor, lekin u qo'shimcha loyiha; asosiy tavsiya
shu Capacitor o'rami: saytga kiritilgan har qanday o'zgarish keyingi build'da
avtomatik ilovada ham chiqadi.

APK fayl GitHub Releases'dan tarqatiladi, saytning `/download` sahifasida
QR-kod va yuklab olish tugmasi shu manzilga ishora qiladi.

## Stek

- **React sayt** (`boyxon/client`) + **Capacitor 8** (WebView o'rami)
- Native ko'prik: `client/src/lib/native.ts` (status bar, klaviatura, splash,
  back tugma, Google OAuth Custom Tab, deep-link)
- Deep-link: `boyxon://auth/callback?code=...` (Google qaytishi)
- Build: GitHub Actions (`.github/workflows/boyxon-apk.yml`) — Java/Android SDK
  talab qilmaydi

## Tuzilma (ilovaga tegishli)

```
boyxon/client/
├── capacitor.config.ts      # appId uz.boyxon.oshxonasi, http sxema (cookie uchun)
├── .env.capacitor           # lokal sinov manzillari (10.0.2.2)
├── src/lib/native.ts        # native ko'prik (faqat APK ichida ishlaydi)
├── src/pages/auth/AuthPage.tsx  # Google tugmasi native'da Custom Tab ochadi
└── android/                 # Capacitor generatsiyasi (git'da, cap sync yangilaydi)
```

## Lokal ishga tushirish

```powershell
# 1) Backend ishda bo'lsin
cd boyxon\server
npm run dev:local   # http://localhost:5000 + 24 taom seed

# 2) Frontend (brauzerda 1:1 ko'rinish)
cd boyxon\client
npm run dev         # http://localhost:5173
```

> Emulyatorda sinash uchun API manzili `http://10.0.2.2:5000/api`
> (`.env.capacitor` da tayyor). Haqiqiy telefonda — kompyuter LAN IP:
> `http://192.168.x.x:5000/api`.

## Release APK yig'ish (avtomatik)

Har `main` ga push'da GitHub Actions APK yig'adi:

1. GitHub → repo → **Actions** → `Boyxon APK` → yugurilgan build
2. **Artifacts** → `boyxon-apk` → `app-debug.apk` ni yuklab oling
3. Telefonga ko'chirib o'rnating (Noma'lum manbaga ruxsat)

Qo'lda boshqa serverga yig'ish: Actions → **Run workflow** →
`api_url` ga masalan `https://boyxon-server.onrender.com/api` yozing.

## Yangi versiya chiqarish (sayt QR → APK)

1. GitHub'da **Release** yarating, tag `v1.0.1` kabi
2. Yuqoridagi Actions'dan chiqqan APK'ni **aniq `boyxon.apk` nomi bilan** yuklang:

   `https://github.com/Nematulloh-uzb/Boyxon-Oshxonasi/releases/latest/download/boyxon.apk`

   Sayt `DownloadPage.tsx` default'i shu manzil (yoki `VITE_APK_URL` bilan
   almashtiriladi). Asset nomi o'zgarsa QR/tugma ishlamaydi!

## Nega aynan Capacitor (1:1 kafolat sababi)

- APK ichida saytning `dist/` build'i ishlaydi — dizayn, til (uz/ru/en),
  savat, checkout, chat, admin panel — hammasi bir xil kod.
- Cookie/auth: `androidScheme: 'http'` — server dev rejimida `sameSite=lax`
  cookie qo'yadi, WebView'da refresh ishlaydi.
- Google login: WebView bloklaydi → tizim brauzeri (Custom Tab) + qaytish
  `boyxon://` deep-link orqali.
- Back tugma, status bar rangi, klaviatura resize — `src/lib/native.ts`.

## Eski Flutter ilova (ixtiyoriy)

`boyxon/mobile/` — alohida Flutter loyiha (qo'lda 1:1 saqlanadi). Capacitor
asosiy yo'l bo'lgani uchun u hozir zaxira sifatida turibdi.
