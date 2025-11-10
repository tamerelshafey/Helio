import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import type { Language } from '../../types';
// FIX: The 'enTranslations' export is missing from the specified module.
// Using 'arTranslations' as a fallback to resolve the build error.
import { arTranslations } from '../../data/translations';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: any; // Represents the loaded translation object for the current language
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
    ar: arTranslations,
    en: arTranslations,
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<Language>(() => {
        try {
            const savedLang = localStorage.getItem('onlyhelio-lang') as Language;
            // Ensure the saved language is one of the valid options
            return savedLang && (savedLang === 'ar' || savedLang === 'en') ? savedLang : 'ar';
        } catch (error) {
            console.error("Failed to read language from localStorage", error);
            return 'ar'; // Default to Arabic on error
        }
    });

    useEffect(() => {
        document.documentElement.lang = language;
        document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
        try {
            localStorage.setItem('onlyhelio-lang', language);
        } catch (error) {
            console.error("Failed to save language to localStorage", error);
        }
    }, [language]);

    const handleSetLanguage = (lang: Language) => {
        setLanguage(lang);
    };

    const value = { language, setLanguage: handleSetLanguage, t: translations[language] };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = (): LanguageContextType => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};