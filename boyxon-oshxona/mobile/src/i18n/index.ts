import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import uz from './uz.json';
import ru from './ru.json';
import en from './en.json';

// XATO 11 tuzatish: til real almasinadi (Zustand tilAlmash bilan)
if (!i18n.isInitialized) {
  void i18n.use(initReactI18next).init({
    lng: 'uz',
    fallbackLng: 'uz',
    resources: {
      uz: { translation: uz },
      ru: { translation: ru },
      en: { translation: en },
    },
    interpolation: { escapeValue: false },
  });
}

export { i18n };
