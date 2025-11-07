import React, { createContext, useContext, useState, useEffect } from 'react';
import translations from '../locales/translations';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // Check localStorage first, then browser language, default to English
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && ['en', 'hi', 'kn'].includes(savedLanguage)) {
      return savedLanguage;
    }
    
    // Check browser language
    const browserLang = navigator.language.split('-')[0];
    if (['hi', 'kn'].includes(browserLang)) {
      return browserLang;
    }
    
    return 'en'; // Default to English
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
  }, [language]);

  const changeLanguage = (newLanguage) => {
    if (['en', 'hi', 'kn'].includes(newLanguage)) {
      setLanguage(newLanguage);
    }
  };

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language];
    
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) {
        console.warn(`Translation missing for key: ${key} in language: ${language}`);
        return key;
      }
    }
    
    return value || key;
  };

  const value = {
    language,
    changeLanguage,
    t,
    languages: [
      { code: 'en', name: 'English', nativeName: 'English' },
      { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
      { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' }
    ]
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

