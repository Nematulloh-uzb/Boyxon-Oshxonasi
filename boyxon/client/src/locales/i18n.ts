import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import uz from './uz.json';
import ru from './ru.json';
import en from './en.json';

const saved = localStorage.getItem('boyxon-lang') ?? 'uz';

// Eski build/localStorage'dagi '{count}' (bitta qavs) yozuvlar ham uchraydi —
// ularni to'g'rilab olamiz, aks holda ekranda "{count} ta" xom matn chiqadi.
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
  lng: saved,
  fallbackLng: 'uz',
  // Flat dot-notation keys (e.g. "home.greeting") — do NOT split on "."
  keySeparator: false,
  nsSeparator: false,
  interpolation: { escapeValue: false },
});

i18n.on('languageChanged', (lng) => {
  localStorage.setItem('boyxon-lang', lng);
  document.documentElement.lang = lng;
});

export default i18n;

