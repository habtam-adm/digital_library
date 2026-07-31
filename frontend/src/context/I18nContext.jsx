import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import translations from "../i18n/translations";
import { formatDualDate, formatEthiopian, formatGregorian } from "../utils/ethiopianDate";

const I18nContext = createContext(null);
const STORAGE_KEY = "wku_language";

export function I18nProvider({ children }) {
  const [language, setLanguage] = useState(
    () => localStorage.getItem(STORAGE_KEY) || "en",
  );

  const changeLanguage = useCallback((next) => {
    setLanguage(next);
    localStorage.setItem(STORAGE_KEY, next);
    document.documentElement.lang = next;
  }, []);

  const value = useMemo(() => {
    const dictionary = translations[language] || translations.en;
    // t("results_count", { count: 12 }) replaces {count} in the string.
    const t = (key, params) => {
      const template = dictionary[key] ?? translations.en[key] ?? key;
      if (!params) return template;
      return Object.entries(params).reduce(
        (text, [name, replacement]) => text.replaceAll(`{${name}}`, replacement),
        template,
      );
    };
    return {
      language,
      changeLanguage,
      t,
      // Picks the Amharic column when the interface is in Amharic, otherwise the
      // English one (columns come as either `field` or `field_en`).
      localized: (row, field) =>
        (language === "am" && row?.[`${field}_am`]) ||
        row?.[field] ||
        row?.[`${field}_en`] ||
        "",
      formatDate: (value) => formatDualDate(value, language),
      formatEthiopianDate: (value) => formatEthiopian(value, language),
      formatGregorianDate: (value) => formatGregorian(value, language),
    };
  }, [language, changeLanguage]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n must be used inside I18nProvider");
  return context;
}
