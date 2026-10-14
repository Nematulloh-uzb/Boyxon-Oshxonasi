# 🎨 DESIGN.md — Boyxon Oshxonasi (React + Tailwind web)

> Yagona dizayn manbai. Barcha yangi ekranlar shu faylga mos bo'lishi shart.
> Asosiy fayllar: `boyxon/client/src/styles/globals.css` (CSS o'zgaruvchilar),
> `boyxon/client/tailwind.config.ts` (tokenlar). Til: uz/ru/en (`src/locales/`).
> Valyuta: `45 000 UZS` (`formatPrice()`). Telefon formati: `+998 XX XXX XX XX`.

## 1. Ranglar (ikkala rejim — CSS o'zgaruvchilar orqali)

| Token (Tailwind) | Light | Dark | Ishlatilishi |
|---|---|---|---|
| `bg-bg` | #FFF8F0 (krem) | #121212 | Asosiy fon |
| `bg-surface` | #FFFFFF | #1E1E1E | Karta / sheet foni |
| `bg-surface-raised` | #FDF1E4 | #252525 | Hover, ichki qatlam |
| `border-ink-line` | #ECE5DC | #333333 | Chegara |
| `text-fg` / `text-ink-900` | #2C2C2C | #F5F5F5 | Asosiy matn |
| `text-ink-300` (fg-subtle) | #7F8C8D | #A0A0A0 | Ikkinchi matn |
| `text-primary-600` | #D35400 | — | Asosiy aksent matn |
| `bg-primary-500` | #E67E22 | #E67E22 | CTA tugma (gradient → #F39C12) |
| `text-success` | #27AE60 | #2ECC71 | Muvaffaqiyat |
| `text-danger` | #E74C3C | #FF6B5E | Xato |

Rejim: `document.documentElement.classList.toggle('dark')` — `darkMode: 'class'`.
Default rejim: **dark** (guest `localStorage['boyxon-theme']`, user preference ustuvor).

## 2. Tipografiya

- Sarlavha: `font-display` → **Epilogue** (700–800)
- Tana: `font-body` → **Inter** (400–500)
- Narx: `font-bold` + `formatPrice()` → `45 000 UZS`
- Tugma matni: 15px semibold; katta harf faqat chip/badge'lar uchun

## 3. Radius / soyalar / oraliq

- Karta: `rounded-card` (20px) + `border border-ink-line/60 bg-surface shadow-sm`
- Tugma: `rounded-full` · sm `h-9` · md `h-12` · lg `h-[52px]`
- Oraliq: ekran cheti `px-4` · karta ichi `p-4..p-6` · seksiyalar `space-y-5/6`
- Breakpoints: sm 480 · md 768 · lg 1024 · xl 1280 · 2xl 1440 (mobile-first)

## 4. Komponent holatlari (majburiy)

Har ekranda 4 holat: **Loading (Skeleton)** / **Content** / **Empty** / **Error**.
- Loading: `<Skeleton>` yoki `Loader2` spinner
- Empty: ikonka + sarlavha + CTA tugma (`cart.empty`, `home.no_dishes`)
- Error: `bg-danger/10` banner + "Qayta urinish" (`common.retry`)
- Rasm: `image: null` yoki xato (`onError`) → `DishPlaceholder`

## 5. Asosiy ekranlar (React Router — `src/routes/AppRouter.tsx`)

- `/` HomePage — qidiruv, promo banner, kategoriya chip'lar, taom grid
- `/dish/:slug` DishPage — taom + sharhlar
- `/cart` CartPage (auth + email tasdiqlangan)
- `/orders/:id` OrderDetailPage (auth + email tasdiqlangan)
- `/settings` SettingsPage — profil, manzil, buyurtma, til, tema
- `/auth`, `/verify-email`, `/forgot-password`, `/reset-password/:token`
- `/admin/*` — AdminRoute (faqat `role=admin`)

## 6. UI primitive'lar (`src/components/ui/`)

`Button` (variant: primary/outline/ghost/danger) · `Card` · `Sheet` (modal) ·
`Input` · `Switch` · `Badge` (tone: promo/success/danger) · `Skeleton`

## 7. Xususiyatlar

- Toast: `sonner` (`Toaster position="top-center" richColors`)
- Forma: `react-hook-form` + `zod` (`src/lib/validators.ts`)
- Ma'lumot: React Query (global `staleTime: 60s`, `refetchOnWindowFocus: true`)
- Real-time: Socket.IO (`order:status`, `notification:new`)
- i18n: flat kalitlar (`"nav.home"`), `keySeparator: false`
