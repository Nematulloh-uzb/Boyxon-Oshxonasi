# Cloudflare Workers'ga deploy qilish

Bu hujjat Boyxon Oshxonasi'ni Render'dan **Cloudflare Workers** (bepul reja) ga
ko'chirishning oxirgi bosqichlarini tushuntiradi.

## Nima allaqachon qilingan

- React SPA Workers Assets orqali beriladi — sayt va API **bitta domenda**
  (CORS, cookie va WebSocket uchun qulay).
- Express ilovasi `ApiServer` Durable Object ichida ishlaydi; MongoDB ulanishi
  DO xotirasida saqlanadi.
- `bcrypt` `PasswordHasher` DO'da bajariladi (Worker'ning 10 ms CPU limitidan
  qochish uchun).
- Real-time `RealtimeHub` DO + native WebSocket (`/ws?token=...`) orqali.
- Email HTTP provayderlar (Brevo/Resend) qo'llab-quvvatlanadi — Workers'da SMTP
  ishlamaydi.
- APK `client/public/` dan `client/apk/` ga ko'chirildi (Workers Assets 25 MiB
  limitidan katta). Uni alohida joyga yuklash kerak (quyida).

## 1. Cloudflare akkauntini yaratish

1. <https://dash.cloudflare.com/sign-up> — email + parol bilan ro'yxatdan o'ting.
2. Emailni tasdiqlang.
3. Birinchi marta Workers ishlatganda Cloudflare **workers.dev subdomain**
   tanlashni so'raydi (masalan, `boyxon`). Uni yozib qo'ying — sayt manzili
   shunday bo'ladi:

   ```
   https://boyxon-server.<subdomain>.workers.dev
   ```

   Subdomain'ni keyin **Workers & Pages → Settings** bo'limida ko'rish yoki
   o'zgartirish mumkin.

## 2. Wrangler'ni ulash

Loyiha papkasida (PowerShell):

```powershell
cd boyxon\server
npx wrangler login
```

Brauzer ochiladi → **Allow** bosing. Tekshirish:

```powershell
npx wrangler whoami
```

## 3. Kerakli tashqi xizmatlar

### MongoDB Atlas — allaqachon bor

`MONGODB_URI` **to'g'ridan-to'g'ri hostlar** bilan bo'lishi shart
(`mongodb+srv://` Workers'da ishlamaydi). `.dev.vars` dagi qiymat shunday:

```
mongodb://user:pass@ac-....mongodb.net:27017,.../boyxon?authSource=admin&replicaSet=...&tls=true
```

Atlas → **Database Access** da foydalanuvchi, **Network Access** da
`0.0.0.0/0` (yoki Cloudflare IP'lari) ruxsat etilgan bo'lsin.

### Cloudinary — rasm yuklash uchun (majburiy)

1. <https://cloudinary.com/users/register/free> — bepul akkaunt.
2. Dashboard'dan **Cloud name**, **API Key**, **API Secret** ni oling.
3. Bulutli qiymatlarni `.dev.vars` ga yozing:

   ```
   CLOUDINARY_CLOUD_NAME=...
   CLOUDINARY_API_KEY=...
   CLOUDINARY_API_SECRET=...
   ```

   Workers'da lokal fayl tizimi yo'q — Cloudinary sozlanmasa admin panelda
   rasm yuklash ishlamaydi.

### Brevo — email uchun (tavsiya etiladi, bepul)

Cloudflare Workers'dan Gmail SMTP chiqmaydi (`ETIMEDOUT`). Brevo bepul rejasi
kuniga ~300 xat beradi.

1. <https://www.brevo.com> da akkaunt yarating.
2. **Senders, Domains & Dedicated IPs → Senders** da yuboruvchi manzilni
   qo'shing va tasdiqlang (masalan, o'z Gmail'ingiz yoki `no-reply@boyxon.uz`).
3. **SMTP & API → API Keys** da yangi API kalit yarating.
4. `.dev.vars` ga yozing:

   ```
   EMAIL_PROVIDER=brevo
   BREVO_API_KEY=xkeysib-...
   EMAIL_FROM=Boyxon Oshxonasi <tasdiqlangan-manzil>
   ```

   `EMAIL_FROM` Brevo'da tasdiqlangan sender bilan bir xil bo'lishi kerak.

> Resend ham ishlaydi: `EMAIL_PROVIDER=resend`, `RESEND_API_KEY=re_...`.
> Domen tasdiqlanmagan bo'lsa, Resend faqat o'z test manziliga xat yuboradi.

### Google OAuth (ixtiyoriy)

Deploy'dan keyin Google Cloud Console → **APIs & Services → Credentials** →
OAuth client → **Authorized redirect URIs** ga qo'shing:

```
https://boyxon-server.<subdomain>.workers.dev/api/auth/google/callback
```

## 4. Secretlarni tayyorlash

`.dev.vars` faylida quyidagilar bo'lishi shart:

| Kalit | Izoh |
| --- | --- |
| `MONGODB_URI` | To'g'ridan-to'g'ri hostlar bilan |
| `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `JWT_RESET_SECRET`, `JWT_EMAIL_VERIFY_SECRET` | Har biri kamida 32 belgi, bir-biridan farq qiladi |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Admin hisobi (parol kamida 12 belgi) |
| `CLOUDINARY_*` | Rasm yuklash |
| `BREVO_API_KEY` yoki `RESEND_API_KEY` | Email |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Ixtiyoriy |
| `VAPID_*` | Push (ixtiyoriy) |

`NODE_ENV`, `PORT`, `TRUST_PROXY` — `wrangler.jsonc` dagi `vars` orqali
beriladi; ularni secret sifatida yuklash shart emas.

## 5. Deploy

Eng oson yo'l — tayyor skript:

```powershell
cd boyxon\server

# URL'ni o'zingiznikiga almashtiring:
powershell -ExecutionPolicy Bypass -File .\scripts\deploy-cloudflare.ps1 `
  -SiteUrl https://boyxon-server.<subdomain>.workers.dev
```

Skript nima qiladi:

1. `boyxon/client` ni `VITE_SITE_URL` bilan build qiladi (canonical/OG/sitemap
   absolut URL'lar bilan).
2. `npx wrangler deploy` — Worker va Durable Object'lar yaratiladi.
3. `.dev.vars` dan secretlarni bulk yuklaydi; `CLIENT_URL` va
   `GOOGLE_CALLBACK_URL` ni `SiteUrl` ga almashtiradi.
4. `/health` ni tekshiradi.

Qo'lda qilish (skript ishlamasa):

```powershell
# 1) Client build
cd boyxon\client
$env:VITE_SITE_URL = "https://boyxon-server.<subdomain>.workers.dev"
npm run build

# 2) Worker deploy
cd ..\server
npx wrangler deploy

# 3) Secretlar (production-secrets.json — .gitignore'da)
#    .dev.vars dan nusxa olib, CLIENT_URL ni production URL'ga o'zgartiring
npx wrangler secret bulk .wrangler\production-secrets.json
```

## 6. Tekshirish

```powershell
$site = "https://boyxon-server.<subdomain>.workers.dev"

Invoke-RestMethod "$site/health"
Invoke-RestMethod "$site/api/categories"
Invoke-WebRequest "$site/" -UseBasicParsing | Select-Object StatusCode
Invoke-WebRequest "$site/sitemap.xml" -UseBasicParsing | Select-Object StatusCode
```

Brauzerda:

1. Sayt ochilishi va taomlar yuklanishi.
2. Login / ro'yxatdan o'tish.
3. Admin panelda rasm yuklash (Cloudinary).
4. Chat va buyurtma holati real vaqtda yangilanishi (WebSocket).
5. Parol tiklash xati kelishi (Brevo/Resend).

Loglar:

```powershell
cd boyxon\server
npx wrangler tail
```

## 7. Custom domen (ixtiyoriy)

Workers & Pages → `boyxon-server` → **Settings → Domains & Routes** →
**Add custom domain**. Masalan, `boyxon.uz` yoki `api.boyxon.uz`.

Domen qo'shilgach:

1. Skriptni yangi URL bilan qayta ishlating
   (`-SiteUrl https://boyxon.uz`).
2. Google OAuth callback'ni yangilang.
3. Mobile ilovadagi URL'larni yangilang.

## 8. APK'ni joylash

Workers Assets 25 MiB dan katta faylni qabul qilmaydi. Variantlar:

- **Cloudflare R2** (bepul 10 GB): bucket yarating → `boyxon-mobile.apk` ni
  yuklang → public URL oling.
- **GitHub Releases**: repo'da Release yaratib, APK'ni attach qiling.

Keyin:

```powershell
cd boyxon\client
$env:VITE_APK_URL = "https://.../boyxon-mobile.apk"
$env:VITE_SITE_URL = "https://boyxon-server.<subdomain>.workers.dev"
npm run build
cd ..\server
npx wrangler deploy
```

## 9. Mobile ilovani yangilash

`boyxon/mobile/lib/core/config/app_config.dart` faylida:

```dart
static const apiBaseUrl = String.fromEnvironment(
  'API_BASE_URL',
  defaultValue: 'https://boyxon-server.<subdomain>.workers.dev',
);
static const siteUrl = String.fromEnvironment(
  'SITE_URL',
  defaultValue: 'https://boyxon-server.<subdomain>.workers.dev',
);
```

So'ng APK'ni qayta yig'ing.

## 10. Render'ni o'chirish

Faqat quyidagilar production Worker'da tekshirilgach:

- login / refresh / logout
- buyurtma yaratish va admin yangilashi
- chat (WebSocket)
- email (parol tiklash)
- rasm yuklash

Keyin Render dashboard'da `boyxon-server` va `boyxon-client` servislarini
to'xtatib, keyin o'chirish mumkin. `render.yaml` faylini ham olib tashlash
mumkin (lekin avval bir necha kun Worker barqaror ishlashini kuting).

## Bepul reja cheklovlari

- **100 000 so'rov/kun** (Workers; UTC yarim kechada yangilanadi).
- Har bir so'rovga **10 ms CPU** — shu sababli bcrypt alohida DO'da.
  MongoDB so'rovlari I/O, CPU emas.
- Durable Objects SQLite bilan bepul rejada ishlaydi.
- Workers Assets: har bir fayl **25 MiB** gacha, 20 000 fayl.
- Aniq limitlarni <https://developers.cloudflare.com/workers/platform/limits/>
  da tekshiring.

## Muammolarni bartaraf etish

| Belgi | Sabab / yechim |
| --- | --- |
| `500 Server xatosi`, `/health` ishlamaydi | Secretlar yuklanmagan yoki `CLIENT_URL` localhost. `npx wrangler secret list` bilan tekshiring. |
| `MongoServerSelectionError` | Atlas Network Access'da Cloudflare ruxsat etilmagan yoki URI `mongodb+srv://`. |
| Login juda sekin (birinchi so'rov) | DO sovuq start + Atlas ulanishi. Keyingi so'rovlar tez. |
| Chat ulanmaydi | `wss://<domen>/ws?token=...`; token muddati o'tgan bo'lsa refresh kerak. |
| Email ketmaydi | `EMAIL_PROVIDER=brevo`, `BREVO_API_KEY` va tasdiqlangan `EMAIL_FROM`. `wrangler tail` da `Brevo 4xx` ni ko'ring. |
| Rasm yuklanmaydi | `CLOUDINARY_*` bo'sh yoki noto'g'ri. |
| `Asset too large` | `client/dist` da 25 MiB dan katta fayl bor — APK `apk/` papkasida turishi kerak. |

## Rollback

```powershell
cd boyxon\server
npx wrangler deployments list
npx wrangler rollback
```
