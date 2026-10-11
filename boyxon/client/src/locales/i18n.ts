import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import uz from './uz.json';
import ru from './ru.json';
import en from './en.json';

const saved = localStorage.getItem('boyxon-lang') ?? 'uz';

void i18n.use(initReactI18next).init({
  resources: {
    uz: { translation: uz },
    ru: { translation: ru },
    en: { translation: en },
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

