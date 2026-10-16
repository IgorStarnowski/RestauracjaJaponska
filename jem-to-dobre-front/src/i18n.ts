import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import translationJA from "./locales/ja.json";
import translationPL from "./locales/pl.json";

const resources = {
  pl: {
    translation: translationPL,
  },
  ja: {
    translation: translationJA,
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "pl", // Domy�lny j�zyk
  fallbackLng: "pl", // J�zyk awaryjny
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
