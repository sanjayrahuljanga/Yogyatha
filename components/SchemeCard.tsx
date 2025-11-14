import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Scheme, Language } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../hooks/useTranslation';
import Icon from './Icons';
import { geminiService } from '../services/geminiService';
import { api } from '../services/api';

interface SchemeCardProps {
    scheme: Scheme;
    onViewDetails: (scheme: Scheme) => void;
    onTrackApplication: (scheme: Scheme) => void;
    username: string;
}

const SchemeCard: React.FC<SchemeCardProps> = ({ scheme, onViewDetails, onTrackApplication, username }) => {
    const { language } = useLanguage();
    const { t, lang } = useTranslation();
    const [summary, setSummary] = useState(scheme.easySummary?.[lang]);
    const [isSummaryLoading, setIsSummaryLoading] = useState(false);
    const [isTracked, setIsTracked] = useState(false);

    useEffect(() => {
        const checkIsTracked = async () => {
            const trackedApps = await api.getTrackedApplications(username);
            if (trackedApps.some(app => app.schemeId === scheme.id)) {
                setIsTracked(true);
            }
        };
        checkIsTracked();
    }, [scheme.id, username]);

    const handleGenerateSummary = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (summary) return;
        setIsSummaryLoading(true);
        try {
            const generatedSummary = await geminiService.generateEasySummary(scheme, lang);
            setSummary(generatedSummary);
            // Optionally, we could save this summary back to the main state/DB
        } catch (error) {
            console.error("Failed to generate summary:", error);
            alert("Could not generate summary at this time.");
        } finally {
            setIsSummaryLoading(false);
        }
    };
    
    const handleTrackClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isTracked) return;
        onTrackApplication(scheme);
        setIsTracked(true); // Optimistic update
    };

    const scoreColor = (score = 0) => {
        if (score >= 9) return 'bg-green-500';
        if (score >= 7) return 'bg-yellow-500';
        return 'bg-orange-500';
    };

    return (
        <button
            onClick={() => onViewDetails(scheme)}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-lg h-full flex flex-col border border-slate-200 dark:border-slate-700 overflow-hidden transition-shadow hover:shadow-xl text-left w-full focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
        >
            <div className="p-6 flex-grow">
                <div className="flex justify-between items-start mb-3">
                    <div className="flex-shrink-0 bg-teal-100 dark:bg-teal-500/20 p-3 rounded-full">
                        <Icon icon={scheme.icon || 'shield-check'} className="w-8 h-8 text-teal-500" />
                    </div>
                    {scheme.score && (
                         <div className={`text-white text-xs font-bold px-3 py-1 rounded-full ${scoreColor(scheme.score)}`}>
                             Score: {scheme.score}/11
                         </div>
                    )}
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">{scheme.name[language]}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 mb-4">
                    {scheme.description[language]}
                </p>
                {summary && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 bg-yellow-50 dark:bg-yellow-500/10 border-l-4 border-yellow-400 rounded-r-md text-xs text-yellow-800 dark:text-yellow-200 mb-4">
                        <p className="font-semibold mb-1">{t('easySummaryButton')}:</p>
                        {summary}
                    </motion.div>
                )}
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 grid grid-cols-2 gap-3 text-sm">
                 <button
                    onClick={handleTrackClick}
                    disabled={isTracked}
                    className={`px-4 py-2 font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                        isTracked
                            ? 'bg-green-600 text-white cursor-default'
                            : 'bg-teal-600 text-white hover:bg-teal-700 focus:ring-teal-500'
                    } ${!summary ? '' : 'col-span-2'}`}
                >
                    {isTracked ? t('alreadyTrackedButton') : t('trackApplicationButton')}
                </button>
                 {!summary && (
                     <button 
                        onClick={handleGenerateSummary}
                        disabled={isSummaryLoading}
                        className="px-4 py-2 font-semibold rounded-lg bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-500/30 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 flex items-center justify-center gap-2 disabled:opacity-70"
                     >
                        {isSummaryLoading 
                            ? <><div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>{t('generatingSummary')}</>
                            : <><Icon icon="sparkles" className="w-4 h-4" />{t('easySummaryButton')}</>
                        }
                    </button>
                 )}
            </div>
        </button>
    );
};

export default SchemeCard;