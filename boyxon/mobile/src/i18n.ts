import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import ru from './locales/ru.json';
import uz from './locales/uz.json';

export const LANG_STORAGE_KEY = 'boyxon-lang';
export const SUPPORTED_LANGS = ['uz', 'ru', 'en'] as const;
export type AppLang = (typeof SUPPORTED_LANGS)[number];

// Eski yozuvlardagi '{count}' (bitta qavs) → '{{count}}' (web'dagi bilan bir xil).
function normalizeBraces(dict: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(dict)) {
    out[k] =
      typeof v === 'string'
        ? v.replace(/(?<!\{)\{([A-Za-z_][A-Za-z0-9_]*)\}(?!\})/g, '{{$1}}')
        : v;
  }
  return out;
}

void i18n.use(initReactI18next).init({
  resources: {
    uz: { translation: normalizeBraces(uz as Record<string, unknown>) },
    ru: { translation: normalizeBraces(ru as Record<string, unknown>) },
    en: { translation: normalizeBraces(en as Record<string, unknown>) },
  },
  lng: 'uz',
  fallbackLng: 'uz',
  // Yassi dot-notation kalitlar (masalan, "home.greeting") — nuqtada bo'linmasin.
  keySeparator: false,
  nsSeparator: false,
  interpolation: { escapeValue: false },
});

/** Saqlangan tilni yuklash (splash paytida chaqiriladi). */
export async function loadSavedLanguage(): Promise<void> {
  try {
    const saved = await AsyncStorage.getItem(LANG_STORAGE_KEY);
    if (saved && SUPPORTED_LANGS.includes(saved as AppLang) && saved !== i18n.language) {
      await i18n.changeLanguage(saved);
    }
  } catch {
    /* jim — default til qoladi */
  }
}

i18n.on('languageChanged', (lng) => {
  AsyncStorage.setItem(LANG_STORAGE_KEY, lng).catch(() => undefined);
});

export default i18n;
