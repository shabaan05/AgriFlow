import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, fallbackTranslation } from './translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [currentLang, setCurrentLang] = useState(() => {
    return localStorage.getItem('agriflow_lang') || 'en';
  });

  const changeLanguage = (lang) => {
    setCurrentLang(lang);
    localStorage.setItem('agriflow_lang', lang);
  };

  /**
   * Translate function t(key, defaultText)
   * If key exists in active language, returns it.
   * If missing, falls back to English dictionary.
   * If missing in English, returns defaultText or fallback dynamic translation.
   */
  const t = (key, defaultText = '') => {
    const langDict = translations[currentLang];
    if (langDict && langDict[key] !== undefined) {
      return langDict[key];
    }
    const enDict = translations['en'];
    if (enDict && enDict[key] !== undefined) {
      return enDict[key];
    }
    // Dynamic dictionary fallback for crops, varieties, categories and states
    if (fallbackTranslation[currentLang] && fallbackTranslation[currentLang][key]) {
      return fallbackTranslation[currentLang][key];
    }
    return defaultText || key;
  };

  return (
    <LanguageContext.Provider value={{ currentLang, setLanguage: changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
