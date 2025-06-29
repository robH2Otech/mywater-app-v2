
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { translations } from './language/translations';
import { Language, LanguageContextType, TranslationParams } from './language/types';

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string, params?: TranslationParams): string => {
    const translation = translations[language]?.[key] || key;
    
    if (!params) return translation;
    
    // Replace placeholders with actual values
    return Object.entries(params).reduce((str, [param, value]) => {
      return str.replace(new RegExp(`\\{${param}\\}`, 'g'), value);
    }, translation);
  };

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
