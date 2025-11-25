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
    // Priority: localStorage > googtrans cookie > default to English
    let detectedLang = "en";

    // Check localStorage first (our custom preference)
    const savedLang = localStorage.getItem('preferredLanguage');
    if (savedLang === 'bn' || savedLang === 'en') {
      detectedLang = savedLang;
    } else {
      // Fall back to Google Translate cookie
      const getCookieValue = (name) => {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
          const [key, value] = cookie.split('=').map(c => c.trim());
          if (key === name) return value;
        }
        return null;
      };
      
      const googtransCookie = getCookieValue('googtrans');
      if (googtransCookie) {
        const parts = googtransCookie.split('/');
        const targetLang = parts[parts.length - 1];
        if (targetLang === 'bn') {
          detectedLang = 'bn';
        }
      }
    }

    setLanguage(detectedLang);
  }, []);

  useEffect(() => {
    // Update body class based on language for styling
    if (language === "bn") {
      document.body.classList.add('lang-bn');
      document.documentElement.lang = 'bn'; // Set lang attribute for proper text rendering
    } else {
      document.body.classList.remove('lang-bn');
      document.documentElement.lang = 'en'; // Always reset to English
    }
  }, [language]);

  const updateLanguage = (newLang) => {
    setLanguage(newLang);
    localStorage.setItem('preferredLanguage', newLang);
  };

  const value = {
    language,
    updateLanguage
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}; 