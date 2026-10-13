# Xavfsizlik — Boyxon Oshxonasi

Bu hujjat loyihada qo'llanilgan xavfsizlik choralarini va **deploy oldidan majburiy
qadamlarni** tavsiflaydi.

> ⚠️ **Eng muhimi:** quyidagi [Deploy oldidan](#deploy-oldidan-majburiy-qadamlar)
> bo'limidagi kalitlarni almashtirish shart. Ular bir marta ochiq kanal orqali
> ko'rilgan (skrinshot/suhbat) va endi xavfsiz hisoblanmaydi.

## Mundarija

- [Autentifikatsiya va sessiyalar](#autentifikatsiya-va-sessiyalar)
- [Brute-force himoyasi](#brute-force-himoyasi)
- [HTTP qatlami](#http-qatlami)
- [Ma'lumotlar va maxfiylik](#malumotlar-va-maxfiylik)
- [Fayl yuklash](#fayl-yuklash)
- [Deploy oldidan majburiy qadamlar](#deploy-oldidan-majburiy-qadamlar)
- [Ataylab qilingan yechimlar](#ataylab-qilingan-yechimlar)

## Autentifikatsiya va sessiyalar

| Mexanizm | Tafsilot |
|---|---|
| Parol xeshlash | bcrypt, 12 raund (`User.model.ts`) |
| Parol siyosati | kamida 8 belgi, harf + raqam aralash |
| Access token | JWT, 15 daqiqa, `sessionStorage`da (localStorage emas) |
| Refresh token | JWT, 7 kun, **httpOnly + secure + sameSite** cookie, `path=/api/auth` |
| Token bekor qilish | `tokenVersion` — parol almashsa/bloklansa barcha tokenlar darhol o'ladi |
| Refresh rotatsiyasi | har yangilanishda `tokenVersion` oshadi → o'g'irlangan refresh token eskiradi |
| Parol tiklash | alohida kalit (`JWT_RESET_SECRET`), 15 daqiqa, **bir marta** ishlaydi |
| Google OAuth | access token URL'da emas — bir martalik kod (60 s) almashtiriladi |

**Nega `tokenVersion` muhim:** faqat JWT imzosini tekshirish yetarli emas. Imzo to'g'ri
bo'lsa ham, token 15 daqiqa (refresh — 7 kun) davomida ishlayveradi. Endi har so'rovda
foydalanuvchining joriy `tokenVersion`i va `isActive` holati bazadan tekshiriladi —
shuning uchun hisobni bloklash yoki parolni almashtirish **bir zumda** kuchga kiradi.

## Brute-force himoyasi

Uch qatlamli himoya:

1. **IP bo'yicha** — `/api/auth/login` va `/register`: 15 daqiqada 10 ta **xato** urinish
   (`skipSuccessfulRequests` — to'g'ri parol bilan kirgan mijoz hech qachon bloklanmaydi).
2. **Hisob bo'yicha** — 5 marta xato parol → hisob 15 daqiqaga qulflanadi
   (`lockedUntil`). IP almashtirib ham chetlab o'tib bo'lmaydi.
3. **Maxfiy amallar** — parol tiklash va kod almashtirish: soatiga 5 urinish.

Bundan tashqari xato xabari har doim bir xil (`Email yoki parol noto'g'ri`) — bu
**user enumeration** (qaysi emaillar ro'yxatda borligini aniqlash) oldini oladi.

## HTTP qatlami

- **CORS** — faqat `CLIENT_URL` ro'yxatidagi domenlar. `*` ishlatilmaydi.
- **Helmet** — xavfsizlik sarlavhalari, production'da HSTS (1 yil, preload).
- **Rate limit** — `/api` uchun 15 daqiqada 600 so'rov.
- **Tana hajmi** — 256 KB (avval 1 MB edi).
- **`TRUST_PROXY`** — faqat proksi ortida turganda `1`. Proksisiz `1` qo'yish
  X-Forwarded-For soxtalashtirish orqali rate-limit ni chetlab o'tish imkonini beradi.
- **Xato boshqaruvi** — stack trace mijozga hech qachon qaytmaydi; buzuq JSON 400 (500 emas).

## Ma'lumotlar va maxfiylik

- Javoblarda `password`, `tokenVersion`, `failedLoginAttempts`, `lockedUntil` **chiqmaydi**.
- Parol tiklash havolasi **logga yozilmaydi** (avval yozilardi — logni ko'rgan odam
  hisobni egallashi mumkin edi).
- Buyurtma narxi **serverda** hisoblanadi — mijoz yuborgan narxga ishonilmaydi.
- Buyurtma/reyting faqat egasiga tegishli (`order.user === auth.id` tekshiriladi).
- Reyting faqat yetkazilgan buyurtmadagi taomlarga qo'yiladi.

## Fayl yuklash

- Oq ro'yxat: JPEG, PNG, WebP, GIF, AVIF — **MIME va kengaytma birgalikda** tekshiriladi.
- **SVG rad etiladi**: u skript saqlay oladi, ya'ni XSS vektori.
- Hajm 5 MB, faqat 1 fayl, maydonlar soni cheklangan.

## Deploy oldidan majburiy qadamlar

### 1. Barcha kalitlarni almashtiring

Quyidagilar ochiq kanal orqali ko'rilgan — **hammasini yangilang**:

| Nima | Qayerdan |
|---|---|
| MongoDB paroli | Atlas → Database Access → Edit user → Edit password |
| Google OAuth secret | Google Cloud Console → Credentials → yangi secret |
| `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `JWT_RESET_SECRET` | quyidagi buyruq bilan |
| `ADMIN_PASSWORD` | kuchli parol o'ylab toping |

```bash
# Har biri uchun alohida ishga tushiring (uchta har xil kalit kerak):
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### 2. `.env` faylini to'ldiring

```bash
cp boyxon/server/.env.example boyxon/server/.env
# NODE_ENV=production, CLIENT_URL=<haqiqiy domen>, TRUST_PROXY=1 (proksi ortida bo'lsa)
```

Kalitlar bo'sh yoki zaif bo'lsa, production'da server **ishga tushmaydi** — bu ataylab
shunday (fail-closed): zaif kalit bilan ishlab, buzilgandan ko'ra ishga tushmasligi afzal.

### 3. Admin parolini o'zgartiring

Agar admin hisobi eski `Admin123!` paroli bilan yaratilgan bo'lsa — u **public repo'da
ochiq**. Yo'q qilish yo'llari:

```bash
# A) Bazani qayta seed qilish (BARCHA ma'lumot o'chadi — faqat yangi bazada!)
SEED_FORCE=true npm run seed

# B) Yoki mavjud hisob parolini almashtirish (ma'lumot saqlanadi):
#    saytdan "Parolni tiklash" orqali (SMTP sozlangan bo'lishi kerak)
```

> `npm run seed` **butun bazani tozalaydi** (foydalanuvchilar, buyurtmalar, taomlar).
> Production'da tasodifan ishga tushmasligi uchun himoya qo'yilgan: `NODE_ENV=production`
> bo'lsa seed to'xtaydi va aniq tasdiq (`SEED_FORCE=true`) talab qiladi.

### 4. Tekshirish

```bash
cd boyxon/server
npm run lint         # TypeScript xatolar yo'q
npm audit --omit=dev # 0 vulnerabilities bo'lishi kerak
npm test             # 19 ta endpoint tekshiruvi
```

Deploydan keyin:

```bash
curl -I https://<domeningiz>/health   # Strict-Transport-Security sarlavhasi borligini tekshiring
```

## Ataylab qilingan yechimlar

Ba'zi qarorlar "buzgandek" tuyulishi mumkin, lekin ataylab shunday:

**Nega `requireAuth` har so'rovda bazaga murojaat qiladi?**
Bir so'rovga ~1 ms qo'shiladi, evaziga bloklash va parol almashtirish bir zumda kuchga
kiradi. Faqat imzo tekshirilsa, o'g'irlangan token 15 daqiqa ishlashda davom etardi.

**Nega access token `localStorage` da emas?**
`localStorage` XSS orqali o'g'irlansa, token muddatsiz yashaydi. `sessionStorage` tab
yopilishi bilan tozalanadi, uzoq sessiya esa JavaScript o'qiy olmaydigan httpOnly
cookie orqali tiklanadi.

**Nega Google OAuth'da kod ishlatiladi?**
Access token URL query'da yursa — brauzer tarixiga, proksi loglariga va `Referer`
sarlavhasi orqali uchinchi tomonlarga tushadi. Bir martalik kod bu yo'lni yopadi.

**Nega 500 o'rniga 400?**
Buzuq JSON — mijoz xatosi. Ilgari u 500 bo'lib, logga stack yozardi va haqiqiy
server xatolarini ko'rinmas holga keltirardi.

## Hali qo'llanilmagan (kelajak uchun)

- **2FA (TOTP)** — admin hisobi uchun ayniqsa foydali.
- **Refresh tokenlarni bazada saqlash** — hozir stateless; qurilmalar ro'yxatini
  ko'rsatish va alohida qurilmani o'chirish uchun kerak bo'ladi.
- **Audit log** — kim, qachon, qaysi admin amalini bajargani.
- **CSRF token** — hozir `sameSite` + `path=/api/auth` bilan himoyalangan; agar
  cookie butun saytga yoyilsa, qo'shimcha token kerak bo'ladi.
- **Content Security Policy (frontend)** — server tomonida o'rnatilgan, lekin
  statik hosting (Vercel) sozlamalarida ham qo'shish tavsiya etiladi.
