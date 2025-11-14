import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../hooks/useTranslation';
import { Language } from '../types';
import Icon from './Icons';

// FIX: Add optional onLogout prop to handle logout functionality.
interface HeaderProps {
    onLogout?: () => void;
    username?: string;
    onProfile?: () => void;
}

const LanguageButton: React.FC<{
    targetLang: Language;
    currentLang: Language;
    onClick: (lang: Language) => void;
    children: React.ReactNode;
}> = ({ targetLang, currentLang, onClick, children }) => {
    const isActive = currentLang === targetLang;
    return (
        <button
            onClick={() => onClick(targetLang)}
            className={`px-3 py-1 text-sm font-medium rounded-md transition-colors duration-200 ${
                isActive
                    ? 'bg-white text-teal-600 shadow-sm'
                    : 'text-white hover:bg-white/20'
            }`}
        >
            {children}
        </button>
    );
};


const Header: React.FC<HeaderProps> = ({ onLogout, username, onProfile }) => {
    const { language, setLanguage } = useLanguage();
    const { t } = useTranslation();

    return (
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ type: 'spring', stiffness: 70, damping: 20 }}
            className="bg-gradient-to-r from-teal-600 to-cyan-500 text-white shadow-md sticky top-0 z-50"
        >
            <div className="max-w-7xl mx-auto flex justify-between items-center px-4 sm:px-6 lg:px-8 py-3">
                <div className="flex items-center gap-3">
                    <Icon icon="shield-check" className="h-10 w-10 text-white" />
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{t('appTitle')}</h1>
                        <p className="text-xs sm:text-sm text-teal-100 hidden sm:block">{t('appSubtitle')}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2 sm:space-x-4">
                   <div className="flex items-center space-x-1 bg-black/10 rounded-lg p-1">
                       <LanguageButton targetLang={Language.EN} currentLang={language} onClick={setLanguage}>EN</LanguageButton>
                       <LanguageButton targetLang={Language.HI} currentLang={language} onClick={setLanguage}>हिं</LanguageButton>
                       <LanguageButton targetLang={Language.TE} currentLang={language} onClick={setLanguage}>తెలు</LanguageButton>
                   </div>
                   {username && onProfile && (
                        <button
                            onClick={onProfile}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 text-white bg-white/10 hover:bg-white/20"
                            title={t('myProfile')}
                        >
                            <Icon icon="user-circle" className="w-5 h-5" />
                            <span className="hidden sm:inline">{username}</span>
                        </button>
                   )}
                   {/* FIX: Conditionally render logout button if onLogout prop is provided. */}
                   {onLogout && (
                        <button
                            onClick={onLogout}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 text-white bg-white/10 hover:bg-white/20"
                            title={t('logout')}
                        >
                            <Icon icon="arrow-right-on-rectangle" className="w-5 h-5" />
                            <span className="hidden sm:inline">{t('logout')}</span>
                        </button>
                   )}
                </div>
            </div>
        </motion.header>
    );
};

export default Header;