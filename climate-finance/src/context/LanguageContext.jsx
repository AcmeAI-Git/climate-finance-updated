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
    // Get language from cookie with improved parsing
    const getCookieValue = (name) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
      return null;
    };
    
    const googtransCookie = getCookieValue('googtrans');
    const currentLang = googtransCookie ? googtransCookie.split('/')[2] || "en" : "en";
    setLanguage(currentLang);
  }, []);

  useEffect(() => {
    // Update body class based on language
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