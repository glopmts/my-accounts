import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import commonEN from "../../public/locales/en/common.json";
import commonPT from "../../public/locales/pt/common.json";

const getSystemLanguage = () => {
  if (typeof window === "undefined") return "pt";

  const lang = navigator.language || navigator.languages?.[0];

  if (!lang) return "pt";

  if (lang.startsWith("pt")) return "pt";
  if (lang.startsWith("en")) return "en";

  return "pt";
};

const getSavedLanguage = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("lang");
};

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    lng:
      typeof window === "undefined"
        ? "pt"
        : getSavedLanguage() || getSystemLanguage(),
    fallbackLng: "pt",
    resources: {
      pt: {
        common: commonPT,
      },
      en: {
        common: commonEN,
      },
    },
    ns: ["common"],
    defaultNS: "common",
    interpolation: {
      escapeValue: false,
    },
  });
}

export default i18n;
