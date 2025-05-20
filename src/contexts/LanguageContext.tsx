
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Available languages
export type Language = "en";

// Define params type for translation function
type TranslationParams = Record<string, string>;

// Language context type
type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: TranslationParams) => string;
};

// Create context with default values
const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: (key: string) => key,
});

// Translation object type
type Translations = Record<string, Record<string, string>>;

// Translations for English
const translations: Translations = {
  en: {
    // Navigation
    "sidebar.dashboard": "Dashboard",
    "sidebar.units": "Water Units",
    "sidebar.locations": "Locations",
    "sidebar.uvc": "UVC",
    "sidebar.analytics": "Analytics",
    "sidebar.ml_analytics": "ML Analytics",
    "sidebar.alerts": "Alerts",
    "sidebar.filters": "Filters", 
    "sidebar.requests": "Requests",
    "sidebar.users": "Users",
    "sidebar.settings": "Settings",
  }
};

// Language context provider
export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  // Get initial language from localStorage or default to English
  const [language, setLanguageState] = useState<Language>("en");

  // Update localStorage when language changes
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
  };

  // Translation function
  const t = (key: string, params?: TranslationParams) => {
    let text = translations[language][key] || key;
    
    // Replace params in translation string
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        text = text.replace(`{${param}}`, value);
      });
    }
    
    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use the language context
export const useLanguage = () => useContext(LanguageContext);
