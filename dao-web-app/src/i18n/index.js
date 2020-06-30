import i18n from 'i18next';
import { initReactI18next } from "react-i18next";
// @ts-ignore
import eng from './en'
// @ts-ignore
import tc from './tc'
// @ts-ignore
import sc from './sc'



i18n
.use(initReactI18next) // passes i18n down to react-i18next


  // detect user language
  // learn more: https://github.com/i18next/i18next-browser-languageDetector
  // pass the i18n instance to react-i18next.
  // init i18next
  // for all options read: https://www.i18next.com/overview/configuration-options
  .init({
    resources: {
      en: {
        translation: eng
      },
      tchin: {
        translation: tc
      },
      schin: {
        translation: sc
      }
    },
    lng: "en",
    fallbackLng: "en",

    interpolation: {
      escapeValue: false
    }
  });

export default i18n;