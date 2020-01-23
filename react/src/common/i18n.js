import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-xhr-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import moment from 'moment';

import en from '../translations/translation.en.json';
import ko from '../translations/translation.ko.json';

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: en,
      },
      ko: {
        translation: ko,
      },
    },
    fallbackLng: ['ko', 'en'],
    debug: false,
    react: {
      useSuspense: false,
    },
    interpolation: {
      escapeValue: false,
      formatSeparator: ',',
      format: (value, formatting, lng) => {
        if (value instanceof Date) {
          return moment(value).locale(lng).format(formatting);
        }
        return value.toString();
      },
    },
  });


export default i18n;
