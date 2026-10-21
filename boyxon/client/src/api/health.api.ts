import { API_ORIGIN } from './axios';

/**
 * Render free-tier web service 15 daqiqa harakatsizlikdan keyin uxlaydi.
 * Birinchi so'rovda Render o'zining "Application loading" HTML sahifasini
 * ko'rsatadi. Foydalanuvchi bu sahifani ko'rmasligi uchun Google OAuth'ga
 * o'tishdan oldin API uyg'onganini tekshiramiz.
 *
 * Muhim: bu Render sahifasini ilova kodi bilan "yashirish" mumkin emas —
 * u bizning Node serverimiz ishga tushishidan oldin platforma tomonidan
 * yuboriladi. Shuning uchun brauzerni API'ga faqat server tayyor bo'lgach
 * yo'naltiramiz; kutish vaqtida ilovaning o'z spinneri ko'rinadi.
 */

const HEALTH_URL = `${API_ORIGIN}/health`;
/** Render cold start odatda 30–60 soniya; 75 soniya yetarli zaxira. */
const READY_TIMEOUT_MS = 75_000;
const ATTEMPT_TIMEOUT_MS = 15_000;
const RETRY_DELAY_MS = 1_500;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function checkHealthOnce(): Promise<void> {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    throw new Error('Brauzer offline');
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ATTEMPT_TIMEOUT_MS);

  try {
    // Query-param cache'ni chetlab o'tadi va CORS preflight'ni qo'zg'atmaydi
    // (`cache: 'no-store'` ba'zi brauzerlarda qo'shimcha header yuboradi).
    const response = await fetch(`${HEALTH_URL}?t=${Date.now()}`, {
      method: 'GET',
      credentials: 'omit',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Health check HTTP ${response.status}`);
    }

    // Render uyg'onish paytida 200 + HTML loading sahifasini qaytarishi mumkin.
    // Bunday javobni "tayyor" deb hisoblamaymiz.
    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.includes('application/json')) {
      throw new Error('Health check hali JSON qaytarmadi');
    }

    const payload = (await response.json()) as { success?: boolean };
    if (payload?.success !== true) {
      throw new Error('Health check muvaffaqiyatsiz');
    }
  } finally {
    clearTimeout(timer);
  }
}

/** Bir vaqtda bir nechta chaqiruv bo'lsa, bitta umumiy kutishdan foydalanamiz. */
let inFlight: Promise<void> | null = null;

/**
 * API server uyg'onganini kutadi. Muvaffaqiyatli bo'lsa resolve,
 * 75 soniya ichida ulanmasa reject qiladi.
 *
 * Har bir chaqiruvda yangi tekshiruv boshlanadi (keshlanmaydi): foydalanuvchi
 * login sahifasida uzoq turib, server yana uxlab qolishi mumkin.
 */
export function ensureServerReady(): Promise<void> {
  if (inFlight) return inFlight;

  const startedAt = Date.now();

  inFlight = (async () => {
    let lastError: unknown;

    while (Date.now() - startedAt < READY_TIMEOUT_MS) {
      try {
        await checkHealthOnce();
        return;
      } catch (error) {
        lastError = error;
        if (Date.now() - startedAt + RETRY_DELAY_MS >= READY_TIMEOUT_MS) break;
        await delay(RETRY_DELAY_MS);
      }
    }

    throw lastError instanceof Error ? lastError : new Error('Server uyg\'onmadi');
  })().finally(() => {
    inFlight = null;
  });

  return inFlight;
}
