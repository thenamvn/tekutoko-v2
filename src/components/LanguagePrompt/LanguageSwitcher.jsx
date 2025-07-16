import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = ({ onLanguageChange }) => {
    const { t, i18n } = useTranslation();
    const currentLanguage = i18n.language;

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
        localStorage.setItem('language', lng);
        if (onLanguageChange) {
            onLanguageChange(lng);
        }
    };

    useEffect(() => {
        // Load language from localStorage
        const savedLanguage = localStorage.getItem('language') || 'en'; // Default to 'en' if no language is saved
        i18n.changeLanguage(savedLanguage); // Set i18next language
    }, [i18n]);

    return (
        <div className="flex flex-col items-center bg-white rounded-md shadow-md p-4">
            <form className="flex flex-col gap-4">
                <label className="inline-flex items-center">
                    <input
                        type="radio"
                        className="form-radio h-5 w-5 text-green-600"
                        name="language"
                        value="en"
                        checked={currentLanguage === 'en'}
                        onChange={() => changeLanguage('en')}
                    />
                    <span className="ml-2 text-gray-700">{t('languageSwitcher.english')}</span>
                </label>

                <label className="inline-flex items-center">
                    <input
                        type="radio"
                        className="form-radio h-5 w-5 text-green-600"
                        name="language"
                        value="vi"
                        checked={currentLanguage === 'vi'}
                        onChange={() => changeLanguage('vi')}
                    />
                    <span className="ml-2 text-gray-700">{t('languageSwitcher.vietnamese')}</span>
                </label>

                <label className="inline-flex items-center">
                    <input
                        type="radio"
                        className="form-radio h-5 w-5 text-green-600"
                        name="language"
                        value="ja"
                        checked={currentLanguage === 'ja'}
                        onChange={() => changeLanguage('ja')}
                    />
                    <span className="ml-2 text-gray-700">{t('languageSwitcher.japanese')}</span>
                </label>
            </form>
        </div>
    );
};

export default LanguageSwitcher;