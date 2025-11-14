import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { TrackedApplication, ApplicationStatus } from '../types';
import Icon from './Icons';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../hooks/useTranslation';

interface ApplicationManagerProps {
    username: string;
}

const STATUS_OPTIONS: ApplicationStatus[] = ['Applied', 'In Review', 'Documents Requested', 'Approved', 'Rejected'];

const statusStyles: { [key in ApplicationStatus]: string } = {
    'Applied': 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300',
    'In Review': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300',
    'Documents Requested': 'bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-300',
    'Approved': 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300',
    'Rejected': 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300',
};

const ApplicationCard: React.FC<{
    app: TrackedApplication;
    onStatusChange: (appId: string, status: ApplicationStatus) => void;
    onDelete: (appId: string, appName: string) => void;
}> = ({ app, onStatusChange, onDelete }) => {
    const { language } = useLanguage();
    const { t } = useTranslation();
    
    return (
        <motion.li 
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="p-4 bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center gap-4"
        >
            <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-teal-100 dark:bg-teal-500/20 rounded-full flex items-center justify-center">
                    <Icon icon={app.schemeIcon} className="w-6 h-6 text-teal-500" />
                </div>
            </div>
            <div className="flex-grow">
                <h3 className="font-bold text-slate-800 dark:text-slate-100">{app.schemeName[language]}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{t('appliedOnLabel')}: {app.applicationDate}</p>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-center w-full sm:w-auto">
                 <select 
                    value={app.status}
                    onChange={(e) => onStatusChange(app.id, e.target.value as ApplicationStatus)}
                    className={`w-full sm:w-auto text-sm font-semibold rounded-md border-0 focus:ring-2 focus:ring-teal-500 transition-colors py-1.5 pl-3 pr-8 ${statusStyles[app.status]}`}
                 >
                    {STATUS_OPTIONS.map(status => <option key={status} value={status}>{status}</option>)}
                 </select>
                 <button
                    onClick={() => onDelete(app.id, app.schemeName[language])}
                    className="p-2 text-slate-400 dark:text-slate-500 rounded-md hover:bg-red-100 dark:hover:bg-red-500/20 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    aria-label={t('deleteApplicationAriaLabel').replace('{schemeName}', app.schemeName[language])}
                >
                    <Icon icon="trash" className="w-5 h-5" />
                </button>
            </div>
        </motion.li>
    );
};


const ApplicationManager: React.FC<ApplicationManagerProps> = ({ username }) => {
    const { t } = useTranslation();
    const [applications, setApplications] = useState<TrackedApplication[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchApps = async () => {
            setIsLoading(true);
            const apps = await api.getTrackedApplications(username);
            setApplications(apps);
            setIsLoading(false);
        };
        fetchApps();
    }, [username]);

    const handleStatusChange = async (appId: string, status: ApplicationStatus) => {
        setApplications(prev => prev.map(app => app.id === appId ? { ...app, status } : app));
        await api.updateApplicationStatus(username, appId, status);
    };

    const handleDelete = async (appId: string, appName: string) => {
        if (window.confirm(t('deleteApplicationConfirmation').replace('{appName}', appName))) {
            setApplications(prev => prev.filter(app => app.id !== appId));
            await api.deleteTrackedApplication(username, appId);
        }
    };
    
    return (
        <div>
            <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-6">{t('myApplicationsTitle')}</h2>

            {isLoading ? (
                <div className="text-center p-8"><div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div></div>
            ) : applications.length > 0 ? (
                <ul className="space-y-4">
                    <AnimatePresence>
                        {applications.map(app => (
                            <ApplicationCard key={app.id} app={app} onStatusChange={handleStatusChange} onDelete={handleDelete} />
                        ))}
                    </AnimatePresence>
                </ul>
            ) : (
                <div className="text-center py-16 px-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 flex flex-col items-center">
                    <div className="bg-teal-100 dark:bg-teal-500/20 rounded-full p-4 mb-4"><Icon icon="document-text" className="w-16 h-16 text-teal-500" /></div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{t('noTrackedApplicationsTitle')}</h3>
                    <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-2">{t('noTrackedApplicationsMessage')}</p>
                </div>
            )}
        </div>
    );
};

export default ApplicationManager;