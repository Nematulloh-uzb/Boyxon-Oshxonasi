import type { QueryClient } from '@tanstack/react-query';

/**
 * Render free-tier sovuq startida (30–60 soniya) katalog so'rovlari osilib
 * qoladi va foydalanuvchi bo'sh skeleton ko'radi. Buni yumshatish uchun
 * muvaffaqiyatli katalog javoblari localStorage'ga yoziladi va ilova
 * ochilishida React Query keshiga qaytariladi:
 *
 *   - menyu/kategoriyalar birinchi bo'yoqdayoq ko'rinadi;
 *   - fonda odatdagi refetch ketadi (React Query `refetchOnMount: true`),
 *     shuning uchun narx/o'sish ma'lumotlari eskirib qolmaydi.
 *
 * XAVFSIZLIK: faqat ommaviy katalog kalitlari saqlanadi. Foydalanuvchiga
 * tegishli kalitlar (`me`, `orders`, `notifications`, `chat-*`, `admin-*`)
 * hech qachon localStorage'ga tushmaydi — umumiy qurilmada sizib chiqmasin.
 */

const STORAGE_KEY = 'boyxon:query-cache:v1';
/** 24 soatdan eski kesh kerak emas — baribir darhol refetch bo'ladi. */
const MAX_AGE_MS = 24 * 60 * 60 * 1000;
/** localStorage shishib ketmasin: eng yangi 40 ta yozuv saqlanadi. */
const MAX_ENTRIES = 40;
/** Bir nechta query birga tugaydi — yozishni bitta siklga yig'amiz. */
const WRITE_DELAY_MS = 1000;

/** Keshga yozishga ruxsat etilgan query key ildizlari (ommaviy katalog). */
const PUBLIC_ROOTS = new Set(['categories', 'dishes', 'featured']);

interface CacheEntry {
  key: unknown[];
  data: unknown;
  updatedAt: number;
}

interface CacheStore {
  v: 1;
  entries: CacheEntry[];
}

function storage(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    // Private mode yoki brauzer ruxsati yopilgan.
    return null;
  }
}

function isPublicKey(key: readonly unknown[]): boolean {
  const root = key[0];
  return typeof root === 'string' && PUBLIC_ROOTS.has(root);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Eski versiya yoki buzilgan yozuv ilovani yiqitmasligi uchun har bir kesh
 * elementi kutilgan shaklga mos kelishini tekshiramiz.
 *
 * Shakllar queryFn'larga bog'liq:
 *   ['categories']                 → Category[]
 *   ['categories', 'detail', slug] → { data: Category }
 *   ['dishes', filters]            → { data: Dish[], pagination: {...} }
 *   ['dishes', 'detail', slug]     → { data: { dish, reviews } }
 *   ['featured']                   → Dish[]
 */
function isValidEntry(key: readonly unknown[], data: unknown): boolean {
  const [root, sub] = key;

  if (root === 'categories') {
    if (sub === undefined) return Array.isArray(data);
    if (sub === 'detail') return isPlainObject(data) && isPlainObject(data.data);
    return false;
  }

  if (root === 'featured') return Array.isArray(data);

  if (root === 'dishes') {
    if (sub === 'detail') {
      const payload = isPlainObject(data) ? data.data : undefined;
      return isPlainObject(payload) && isPlainObject(payload.dish);
    }
    // Ro'yxat so'rovlari (bosh sahifa, kategoriya, "o'xshash taomlar").
    return isPlainObject(data) && Array.isArray(data.data) && isPlainObject(data.pagination);
  }

  return false;
}

function readEntries(): CacheEntry[] {
  const ls = storage();
  if (!ls) return [];

  try {
    const raw = ls.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as CacheStore;
    if (parsed?.v !== 1 || !Array.isArray(parsed.entries)) return [];

    const now = Date.now();
    return parsed.entries.filter(
      (entry) =>
        Array.isArray(entry.key) &&
        typeof entry.updatedAt === 'number' &&
        entry.updatedAt > 0 &&
        now - entry.updatedAt < MAX_AGE_MS,
    );
  } catch {
    // Buzilgan JSON — keshni e'tiborsiz qoldiramiz.
    return [];
  }
}

/**
 * Saqlangan katalogni React Query keshiga tiklaydi. Renderdan oldin
 * chaqirilishi kerak — shunda birinchi renderdayoq ma'lumot mavjud bo'ladi.
 */
export function hydrateQueryCache(qc: QueryClient): void {
  for (const entry of readEntries()) {
    // Eski/buzilgan shakl — tashlab ketamiz (aks holda render yiqiladi).
    if (!isValidEntry(entry.key, entry.data)) continue;

    // `updatedAt` muhim: React Query ma'lumotni "yangi" deb hisoblamasin va
    // staleTime tugagach fonda yangilashni boshlasin.
    qc.setQueryData(entry.key, entry.data, { updatedAt: entry.updatedAt });
  }
}

/**
 * Katalog so'rovlari muvaffaqiyatli tugagach keshni yangilab turadi.
 * Qaytarilgan funksiya obunani bekor qiladi (test/HMR uchun).
 */
export function persistQueryCache(qc: QueryClient): () => void {
  let timer: ReturnType<typeof setTimeout> | null = null;

  const flush = (): void => {
    timer = null;

    const ls = storage();
    if (!ls) return;

    const entries: CacheEntry[] = [];
    for (const query of qc.getQueryCache().getAll()) {
      if (!isPublicKey(query.queryKey)) continue;
      if (query.state.status !== 'success') continue;
      if (query.state.data === undefined) continue;
      if (!isValidEntry(query.queryKey, query.state.data)) continue;

      entries.push({
        key: [...query.queryKey],
        data: query.state.data,
        updatedAt: query.state.dataUpdatedAt,
      });
    }

    entries.sort((a, b) => b.updatedAt - a.updatedAt);
    const payload: CacheStore = { v: 1, entries: entries.slice(0, MAX_ENTRIES) };

    try {
      ls.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Kvota to'ldi (masalan, brauzerda joy juda kam) — keshni tozalaymiz,
      // ilova ishlashda davom etadi.
      try {
        ls.removeItem(STORAGE_KEY);
      } catch {
        /* e'tiborsiz */
      }
    }
  };

  const unsubscribe = qc.getQueryCache().subscribe((event) => {
    // Faqat yangi ma'lumot kelganda yozamiz: observer qo'shilishi yoki
    // "fetching" holati localStorage'ni behuda bezovta qilmasin.
    if (event.type !== 'updated' || event.action.type !== 'success') return;
    if (timer !== null) return;
    timer = setTimeout(flush, WRITE_DELAY_MS);
  });

  // Sahifa yopilishidan oldin kutilayotgan yozuvni darhol bajarib qo'yamiz.
  const flushNow = (): void => {
    if (timer !== null) {
      clearTimeout(timer);
      flush();
    }
  };
  window.addEventListener('pagehide', flushNow);

  return () => {
    unsubscribe();
    window.removeEventListener('pagehide', flushNow);
    flushNow();
  };
}
