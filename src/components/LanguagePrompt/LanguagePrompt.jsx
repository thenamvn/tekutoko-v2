import React, { useState } from 'react';
import LanguageSwitcher from './LanguageSwitcher';
import { useTranslation } from 'react-i18next';

const LanguagePrompt = ({ onLanguageSelected }) => {
  const { t } = useTranslation();
  const [languageSelected, setLanguageSelected] = useState(false);

  const handleLanguageChange = (lng) => {
    setLanguageSelected(true);
    onLanguageSelected(lng);
  };

  if (languageSelected) {
    return null;
  }

  return (
    <div>
      <LanguageSwitcher onLanguageChange={handleLanguageChange} />
    </div>
  );
};

export default LanguagePrompt;