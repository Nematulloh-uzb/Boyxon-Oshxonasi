# 🎨 DESIGN.md — Boyxon Oshxonasi (Expo + NativeWind)

> Yagona dizayn manbai. Barcha keyingi bosqichlarda shu fayl saqlanadi.
> Til: 100% o'zbek (lotin). Valyuta: `45 000 so'm`. Telefon: `+998 XX XXX XX XX`.

## 1. Ranglar (Material 3 asosida, iliq oshxona temasi)

| Nom | HEX | Ishlatilishi |
|-----|-----|--------------|
| surface | #FFF8F1 | Asosiy fon |
| surface-container-lowest | #FFFFFF | Karta / pastki sheet foni |
| surface-container-low | #F9F3EB | Input foni, ikkinchi darajali karta |
| surface-container | #F4EDE5 | Bo'lim foni |
| surface-container-high | #EEE7DF | Divider, bosilgan holat |
| surface-container-highest | #E8E1DA | Skeleton |
| on-surface | #1E1B17 | Asosiy matn |
| on-surface-variant | #5C403F | Ikkinchi matn |
| outline | #906F6E | Chegara (ingichka) |
| outline-variant | #E5BDBB | Chegara (och) |
| primary | #9E001F | Matn ustidagi asosiy (kichik element) |
| primary-container | #C8102E | Asosiy tugma foni (CTA) |
| on-primary | #FFFFFF | CTA matni |
| on-primary-container | #FFDAD8 | Bosilgandagi aks |
| primary-fixed | #FFDAD8 | Promo banner foni (och qizil) |
| secondary | #825500 | Ogohlantirish matni |
| secondary-container | #FDAB12 | Reyting yulduzi, aksent tugma |
| secondary-fixed | #FFDDB3 | Kupon / chegirma chip foni |
| on-secondary-fixed | #291800 | Chip matni |
| error | #BA1A1A | Xato matni |
| error-container | #FFDAD6 | Xato foni |
| success | #1B7A3D | Muvaffaqiyat (toast) |
| success-container | #D6F5DF | Muvaffaqiyat foni |

## 2. Tipografiya

- Sarlavha (headline): `Epilogue`, 700–800, 22–28sp, `on-surface`
- Tana (body): `Inter`, 400–500, 13–16sp, `on-surface` / `on-surface-variant`
- Narx: `Inter` 700, 16–18sp. Format: `formatPrice()` → `45 000 so'm`
- Tugma: `Inter` 700, 15sp, katta harf YO'Q, o'zbekcha: "Savatchaga qo'shish", "Buyurtma berish"

## 3. Radius / Soyalar / Oraliq

- Radius: DEFAULT 8, md 12, lg 16, xl 20, 2xl 24, full 9999
- Karta: `rounded-2xl bg-white shadow-sm border border-outline-variant/40`
- Tugma CTA: `rounded-full bg-primary-container h-[52px]` + haptics + pressed:opacity-90
- Oraliq: ekran cheti 16, karta ichi 12–16, seksiyalar orasi 20–24

## 4. Komponent holatlari (majburiy)

Har ekranda 4 holat bo'ladi: `Loading (Skeleton)` / `Content` / `Empty` / `Error`.
- Skeleton: `surface-container-highest` pulse
- Empty: rasm + sarlavha + CTA tugma
- Error: `error-container` banner + "Qayta urinish"

## 5. Ekranlar ro'yxati (Expo Router)

- `app/(auth)/index.tsx` — Kirish (telefon + parol, Telegram tugma, OTP havola)
- `app/(auth)/register.tsx` — Ro'yxatdan o'tish (ism, telefon, parol, Zod)
- `app/(auth)/forgot-password.tsx` — Tiklash + 6 xonali OTP
- `app/(tabs)/index.tsx` — Asosiy (salom, qidiruv, promo, kategoriya, mashhur)
- `app/(tabs)/cart.tsx` — Savatcha (stepper, promo BOYXON20, hisob-kitob)
- `app/(tabs)/settings.tsx` — Sozlamalar (profil, til uz/ru/en, Switch)
- `app/category/[id].tsx`, `app/product/[id].tsx`, `app/+not-found.tsx`

## 6. Format util qoidalari

```ts
formatPrice(45000) // "45 000 so'm"
formatPhone("+998901234567") // "+998 90 123 45 67"
phoneSchema = z.string().regex(/^\+998 \d{2} \d{3} \d{2} \d{2}$/, "Telefon +998 XX XXX XX XX bo'lsin")
```
