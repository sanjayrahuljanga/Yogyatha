import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scheme } from '../types';
import SchemeCard from './SchemeCard';
import SchemeDetailModal from './SchemeDetailModal';
import { useTranslation } from '../hooks/useTranslation';
import Icon from './Icons';
import { api } from '../services/api';

interface ResultsProps {
    schemes: Scheme[];
    isLoading: boolean;
    username: string;
}

const Results: React.FC<ResultsProps> = ({ schemes, isLoading, username }) => {
    const { t } = useTranslation();
    const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null);

    const handleViewDetails = (scheme: Scheme) => {
        setSelectedScheme(scheme);
    };

    const handleTrackApplication = async (scheme: Scheme) => {
        try {
            await api.trackApplication(username, scheme);
            // This is an optimistic update. In a real app, you might want to refetch or use a global state.
        } catch (error) {
            alert(error instanceof Error ? error.message : "Could not track application.");
        }
    };
    
    if (isLoading) {
        return (
            <div className="text-center p-8">
                <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="mt-4 text-slate-600 dark:text-slate-300 font-semibold">{t('loading')}</p>
            </div>
        );
    }
    
    if (schemes.length === 0) {
        return (
            <div className="text-center py-16 px-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 flex flex-col items-center">
                 <div className="bg-teal-100 dark:bg-teal-500/20 rounded-full p-4 mb-4">
                     <Icon icon="magnifying-glass" className="w-16 h-16 text-teal-500" />
                 </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{t('noResultsTitle')}</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-2">{t('noResultsMessage')}</p>
            </div>
        );
    }

    return (
        <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">
                {t('resultsTitle')} <span className="text-base font-medium text-slate-500 dark:text-slate-400">({schemes.length} {t('resultsFound')})</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                    {schemes.map((scheme) => (
                        <motion.div
                            key={scheme.id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.3 }}
                        >
                            <SchemeCard 
                                scheme={scheme} 
                                onViewDetails={() => handleViewDetails(scheme)} 
                                onTrackApplication={handleTrackApplication}
                                username={username}
                            />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <AnimatePresence>
                {selectedScheme && (
                    <SchemeDetailModal 
                        scheme={selectedScheme} 
                        onClose={() => setSelectedScheme(null)} 
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default Results;
