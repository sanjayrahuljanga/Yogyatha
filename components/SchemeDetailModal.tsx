import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
// FIX: The `react-to-print` module from the CDN is wrapped in a default object.
import R2P from 'react-to-print';
import { Scheme } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../hooks/useTranslation';
import Icon from './Icons';
import SchemePrintLayout from './SchemePrintLayout';
import { geminiService } from '../services/geminiService';


interface SchemeDetailModalProps {
    scheme: Scheme | null;
    onClose: () => void;
}

const DetailSection: React.FC<{ title: string; items?: string[] | string; icon: string }> = ({ title, items, icon }) => {
    if (!items || (Array.isArray(items) && items.length === 0)) return null;

    return (
        <div>
            <h4 className="text-md font-bold text-slate-700 dark:text-slate-200 mb-2 flex items-center gap-2">
                <Icon icon={icon} className="w-5 h-5 text-teal-500" />
                {title}
            </h4>
            {Array.isArray(items) ? (
                 <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400 text-sm pl-2">
                    {items.map((item, index) => <li key={index}>{item}</li>)}
                </ul>
            ) : (
                <p className="text-slate-600 dark:text-slate-400 text-sm">{items}</p>
            )}
        </div>
    );
};


const SchemeDetailModal: React.FC<SchemeDetailModalProps> = ({ scheme, onClose }) => {
    const { language } = useLanguage();
    const { t, lang } = useTranslation();
    const useReactToPrint = R2P.default || R2P; // Handle module interop
    const printRef = useRef<HTMLDivElement>(null);
    
    const [applicationSteps, setApplicationSteps] = useState<string[]>([]);
    const [isStepsLoading, setIsStepsLoading] = useState(true);
    const [stepsError, setStepsError] = useState<string | null>(null);

    useEffect(() => {
        if (scheme) {
            setIsStepsLoading(true);
            setStepsError(null);
            setApplicationSteps([]);
            
            geminiService.generateApplicationSteps(scheme.name[lang])
                .then(steps => {
                    setApplicationSteps(steps);
                })
                .catch(() => {
                    setStepsError(t('errorApplicationSteps'));
                })
                .finally(() => {
                    setIsStepsLoading(false);
                });
        }
    }, [scheme, lang, t]);

    const handlePrint = useReactToPrint({
        content: () => printRef.current,
        documentTitle: `${scheme?.name[lang] || 'Scheme'} - Yogyatha`,
    });

    if (!scheme) return null;

    const { eligibility } = scheme;
    const eligibilityDetails = [
        `${t('minAge')}: ${eligibility.minAge}`,
        `${t('maxAge')}: ${eligibility.maxAge}`,
        `${t('maxIncome')}: ₹${eligibility.maxIncome.toLocaleString('en-IN')}`,
        `${t('states')}: ${eligibility.states.join(', ')}`,
        `${t('categories')}: ${eligibility.categories.join(', ')}`,
        `${t('roles')}: ${eligibility.roles.join(', ')}`,
    ];
    if (eligibility.genders && eligibility.genders.length > 0) {
        eligibilityDetails.push(`${t('genders')}: ${eligibility.genders.join(', ')}`);
    }

    return (
         <div
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[60]"
            aria-labelledby="scheme-details-title"
            role="dialog"
            aria-modal="true"
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                onClick={e => e.stopPropagation()}
                className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-slate-200 dark:border-slate-700"
            >
                <header className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="flex-shrink-0 bg-teal-100 dark:bg-teal-500/20 p-3 rounded-full">
                            <Icon icon={scheme.icon || 'shield-check'} className="w-8 h-8 text-teal-500" />
                        </div>
                        <div>
                            <h2 id="scheme-details-title" className="text-xl font-bold text-slate-800 dark:text-slate-100">{scheme.name[language]}</h2>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-200">
                        <Icon icon="x-mark" className="w-6 h-6" />
                    </button>
                </header>
                
                <main className="p-6 overflow-y-auto space-y-6">
                    <p className="text-slate-600 dark:text-slate-400 text-base">{scheme.description[language]}</p>
                    
                     {scheme.easySummary?.[lang] && (
                        <div className="p-4 bg-yellow-50 dark:bg-yellow-500/10 border-l-4 border-yellow-400 rounded-r-md">
                            <h3 className="font-bold text-yellow-800 dark:text-yellow-200 text-base flex items-center gap-2">
                               <Icon icon="sparkles" className="w-5 h-5"/>
                               {t('easySummaryButton')}
                            </h3>
                            <p className="text-yellow-700 dark:text-yellow-300 text-sm mt-1">{scheme.easySummary[lang]}</p>
                        </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <DetailSection title={t('eligibilityCriteria')} items={eligibilityDetails} icon="check-circle" />
                        <DetailSection title={t('keyBenefits')} items={scheme.benefits[language]} icon="gift" />
                        <DetailSection title={t('documentsRequired')} items={scheme.documents[language]} icon="document-text" />
                    </div>

                    <div>
                        <h4 className="text-md font-bold text-slate-700 dark:text-slate-200 mb-2 flex items-center gap-2">
                            <Icon icon="clipboard-document-list" className="w-5 h-5 text-teal-500" />
                            {t('howToApply')}
                        </h4>
                        {isStepsLoading ? (
                            <div className="space-y-3 p-2">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full animate-pulse"></div>
                                ))}
                            </div>
                        ) : stepsError ? (
                            <p className="text-sm text-red-500 dark:text-red-400 p-2">{stepsError}</p>
                        ) : (
                            <ol className="list-decimal list-inside space-y-2 text-slate-600 dark:text-slate-400 text-sm pl-2">
                                {applicationSteps.map((step, index) => <li key={index}>{step}</li>)}
                            </ol>
                        )}
                    </div>
                </main>

                <footer className="p-6 border-t border-slate-200 dark:border-slate-700 flex-shrink-0 flex flex-col sm:flex-row justify-end items-center gap-4">
                    <button onClick={handlePrint} className="w-full sm:w-auto px-5 py-2.5 font-semibold rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors flex items-center justify-center gap-2">
                        <Icon icon="document-text" className="w-5 h-5" />
                        {t('printButton')}
                    </button>
                    <a href={scheme.applyLink} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto px-5 py-2.5 text-center bg-teal-600 text-white font-bold rounded-lg shadow-md hover:bg-teal-700 transition-all transform hover:-translate-y-0.5">
                        {t('applyNowButton')}
                    </a>
                </footer>
            </motion.div>
            <div className="hidden">
                <div ref={printRef}>
                    <SchemePrintLayout scheme={scheme} />
                </div>
            </div>
        </div>
    );
};

export default SchemeDetailModal;