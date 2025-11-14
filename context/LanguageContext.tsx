import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Language } from '../types';

interface LanguageContextType {
    language: Language;
    setLanguage: (language: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANG_STORAGE_KEY = 'yogyatha-lang';

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<Language>(() => {
        const storedLang = localStorage.getItem(LANG_STORAGE_KEY);
        // Check if storedLang is a valid Language enum value
        if (storedLang && Object.values(Language).includes(storedLang as Language)) {
            return storedLang as Language;
        }
        return Language.EN; // Default language
    });

    useEffect(() => {
        localStorage.setItem(LANG_STORAGE_KEY, language);
    }, [language]);

    return (
        <LanguageContext.Provider value={{ language, setLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = (): LanguageContextType => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};