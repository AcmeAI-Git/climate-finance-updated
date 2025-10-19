import React, { useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { getClimateFinanceTrackerTransliteration } from '../../utils/transliteration';

const DynamicTitle = () => {
  const { language } = useLanguage();

  useEffect(() => {
    const title = getClimateFinanceTrackerTransliteration(language);
    document.title = title;
  }, [language]);

  return null; // This component doesn't render anything
};

export default DynamicTitle; 