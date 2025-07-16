import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import en from './locales/en/translation.json';
import vi from './locales/vi/translation.json';
import ja from './locales/jp/translation.json';

i18n
  .use(LanguageDetector) // Detect user language
  .use(initReactI18next) // Pass the i18n instance to react-i18next
  .init({
    resources: {
      en: {
        translation: en,
      },
      vi: {
        translation: vi,
      },
      ja: {
        translation: ja,
      },
    },
    fallbackLng: 'en', // Use English if detected language is not available
    interpolation: {
      escapeValue: false, // React already escapes by default
    },
  });

export default i18n;