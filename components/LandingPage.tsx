import React from 'react';
import { motion } from 'framer-motion';
import { Language } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../hooks/useTranslation';
import Icon from './Icons';

interface LandingPageProps {
    onNavigateToAuth: () => void;
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
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
        >
            {children}
        </button>
    );
};

const FeatureCard: React.FC<{ icon: string; title: string; description: string; delay: number }> = ({ icon, title, description, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.5, delay }}
        className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 flex flex-col items-center text-center"
    >
        <div className="bg-teal-100 dark:bg-teal-500/20 p-4 rounded-full mb-4">
            <Icon icon={icon} className="w-10 h-10 text-teal-500" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">{title}</h3>
        <p className="text-slate-600 dark:text-slate-400 text-sm">{description}</p>
    </motion.div>
);

const LandingPage: React.FC<LandingPageProps> = ({ onNavigateToAuth }) => {
    const { language, setLanguage } = useLanguage();
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 overflow-x-hidden">
            {/* Header */}
            <motion.header
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ type: 'spring', stiffness: 70, damping: 20 }}
                className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800"
            >
                <nav className="max-w-7xl mx-auto flex justify-between items-center px-4 sm:px-6 lg:px-8 py-3">
                    <div className="flex items-center gap-3">
                        <Icon icon="shield-check" className="h-8 w-8 text-teal-500" />
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">{t('appTitle')}</h1>
                    </div>
                    <div className="flex items-center space-x-2 sm:space-x-4">
                        <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                           <LanguageButton targetLang={Language.EN} currentLang={language} onClick={setLanguage}>EN</LanguageButton>
                           <LanguageButton targetLang={Language.HI} currentLang={language} onClick={setLanguage}>हिं</LanguageButton>
                           <LanguageButton targetLang={Language.TE} currentLang={language} onClick={setLanguage}>తెలు</LanguageButton>
                        </div>
                        <button 
                         onClick={onNavigateToAuth}
                         className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors bg-teal-600 text-white hover:bg-teal-700 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                       >
                           {t('loginButton')}
                       </button>
                    </div>
                </nav>
            </motion.header>

            {/* Hero Section */}
            <main>
                <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                    >
                        <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">
                            <span className="block">Unlock Your Entitlements.</span>
                            <span className="block text-teal-500">Effortlessly.</span>
                        </h2>
                        <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-slate-600 dark:text-slate-300">
                            {t('dashboardSubtitle')}
                        </p>
                        <div className="mt-10">
                            <button
                                onClick={onNavigateToAuth}
                                className="inline-flex items-center justify-center gap-3 px-10 py-4 bg-teal-600 text-white font-bold text-lg rounded-lg hover:bg-teal-700 transition-all focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                            >
                                {t('findSchemesButton')}
                                <Icon icon="arrow-right-on-rectangle" className="w-6 h-6" />
                            </button>
                        </div>
                    </motion.div>
                </section>

                {/* Features Section */}
                <section className="bg-white dark:bg-slate-800/50 py-20 sm:py-24">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h3 className="text-3xl font-bold text-slate-800 dark:text-slate-100">How It Works</h3>
                            <p className="mt-2 text-slate-500 dark:text-slate-400">A simple, 3-step process to find schemes for you.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <FeatureCard
                                icon="user-circle"
                                title="1. Build Your Profile"
                                description="Answer a few simple questions about your age, income, and location to create a personalized profile."
                                delay={0.1}
                            />
                            <FeatureCard
                                icon="magnifying-glass"
                                title="2. Get Matched"
                                description="Our smart algorithm instantly finds and scores government schemes you're most likely eligible for."
                                delay={0.2}
                            />
                            <FeatureCard
                                icon="arrow-top-right-on-square"
                                title="3. View & Apply"
                                description="Explore detailed benefits, required documents, and get direct links to apply for the schemes."
                                delay={0.3}
                            />
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="text-center p-6 mt-8 text-slate-500 text-sm">
                <p>&copy; {new Date().getFullYear()} Yogyatha. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default LandingPage;