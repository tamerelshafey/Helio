import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import type { Language } from '../../types';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: any; // Represents the loaded translation object for the current language
    isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<Language>('ar');
    const [translations, setTranslations] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        document.documentElement.lang = language;
        document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';

        const loadTranslations = async () => {
            setIsLoading(true);
            try {
                // The JSON files are expected to be in the public/locales directory
                const response = await fetch(`/locales/${language}.json`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setTranslations(data);
            } catch (error) {
                console.error("Could not load translations for", language, error);
                 // Fallback to English if Arabic fails
                if (language !== 'en') {
                    try {
                         const fallbackResponse = await fetch(`/locales/en.json`);
                         const fallbackData = await fallbackResponse.json();
                         setTranslations(fallbackData);
                    } catch (fallbackError) {
                        console.error("Could not load fallback English translations", fallbackError);
                    }
                }
            } finally {
                setIsLoading(false);
            }
        };

        loadTranslations();
    }, [language]);

    const value = { language, setLanguage, t: translations, isLoading };
    
    // Display a loading state while translations are being fetched to prevent errors
    if (isLoading || !translations) {
        return (
             <div className="flex justify-center items-center" style={{ minHeight: '100vh' }}>
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-amber-500"></div>
            </div>
        );
    }


    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};

// Custom hook that components will use to access language context
export const useLanguage = (): Omit<LanguageContextType, 'isLoading'> => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    // Components don't need to know about the loading state, the provider handles it.
    const { isLoading, ...rest } = context;
    return rest;
};
