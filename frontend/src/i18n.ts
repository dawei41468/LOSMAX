import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enNewTranslations from './locales/en-new.json';
import zhNewTranslations from './locales/zh-new.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enNewTranslations,
      },
      zh: {
        translation: zhNewTranslations,
      },
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    keySeparator: '.',
    nsSeparator: ':',
  });

export default i18n;