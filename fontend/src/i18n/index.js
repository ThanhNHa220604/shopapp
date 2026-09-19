import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import vi from "./locales/vi.json";
import en from "./locales/en.json";

const language = localStorage.getItem("language") || "vi";

i18n.use(initReactI18next).init({
  resources: {
    vi: {
      translation: vi,
    },
    en: {
      translation: en,
    },
  },
  lng: language,
  fallbackLng: "vi",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;