
// Available languages
export type Language = "en" | "sl" | "hr";

// Define params type for translation function
export type TranslationParams = Record<string, string>;

// Language context type
export type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: TranslationParams) => string;
};

// Translation object type
export type Translations = Record<string, Record<string, string>>;
