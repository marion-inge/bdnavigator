import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import en from "./locales/en.json";
import de from "./locales/de.json";

export type Language = "en" | "de";
export type TranslationKey = keyof typeof en;

const translations = { en, de } as const;

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("bd-pipeline-lang");
    return (saved === "de" ? "de" : "en") as Language;
  });

  const handleSetLanguage = useCallback((lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("bd-pipeline-lang", lang);
  }, []);

  const t = useCallback(
    (key: TranslationKey) => translations[language][key] || key,
    [language]
  );

  return (
    <I18nContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
