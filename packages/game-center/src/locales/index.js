
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enTranslations from "./translations/en.json"; 
import trTranslations from "./translations/tr.json"; 


const storedLanguage = localStorage.getItem('language');
const initialLanguage = storedLanguage || 'tr';

i18n
  .use(initReactI18next) 
  .init({
    resources: {
      en: {
        translation: enTranslations 
      },
      tr: {
        translation: trTranslations 
      }
    },
    lng: initialLanguage, 
    fallbackLng: "tr", 

    interpolation: {
      escapeValue: false 
    },
  });

export default i18n;