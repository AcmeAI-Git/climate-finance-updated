import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    // Get language from Google Translate cookie on page load
    const getCookieValue = (name) => {
      const cookies = document.cookie.split(';');
      for (let cookie of cookies) {
        const [key, value] = cookie.split('=').map(c => c.trim());
        if (key === name) return value;
      }
      return null;
    };
    
    // Check googtrans cookie format: /en/bn or /en/en
    const googtransCookie = getCookieValue('googtrans');
    if (googtransCookie) {
      const parts = googtransCookie.split('/');
      const targetLang = parts[parts.length - 1]; // Get last part (bn or en)
      if (targetLang === 'bn') {
        setLanguage('bn');
      } else {
        setLanguage('en');
      }
    } else {
      // No cookie found, default to English
      setLanguage('en');
    }
  }, []);

  useEffect(() => {
    // Update body class based on language for styling
    if (language === "bn") {
      document.body.classList.add('lang-bn');
    } else {
      document.body.classList.remove('lang-bn');
    }
  }, [language]);

  const updateLanguage = (newLang) => {
    setLanguage(newLang);
  };

  const value = {
    language,
    updateLanguage
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}; 