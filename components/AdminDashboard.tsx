import React, { useState, useEffect } from 'react';
import { Scheme, User, Language, TrackedApplication } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../hooks/useTranslation';
import Icon from './Icons';
import { geminiService, AiScheme } from '../services/geminiService';
import AdminAnalytics from './AdminAnalytics';
import { api } from '../services/api';

// This is defined in api.ts but we need it here for the type
interface SearchEvent { username: string; state: string; role: string; income: number; timestamp: number; }


const SCHEME_ICONS: string[] = ['users', 'leaf', 'academic-cap', 'light-bulb', 'home', 'briefcase', 'currency-rupee', 'tag', 'shield-check', 'gift'];

const AddSchemeForm: React.FC<{
    onSubmit: (schemeData: Pick<Scheme, 'name' | 'description'> & { icon: string }) => void;
    onCancel: () => void;
}> = ({ onSubmit, onCancel }) => {
    const { t } = useTranslation();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [icon, setIcon] = useState(SCHEME_ICONS[0]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !description.trim()) return;
        onSubmit({
            name: { en: name, hi: name, te: name },
            description: { en: description, hi: description, te: description },
            icon,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold mb-4 text-slate-800 dark:text-slate-100">{t('adminAddSchemeManually')}</h3>
            <div className="space-y-4">
                <div>
                    <label htmlFor="schemeName" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{t('adminSchemeNameLabel')}</label>
                    <input id="schemeName" type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition" />
                </div>
                <div>
                    <label htmlFor="schemeDesc" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{t('adminSchemeDescriptionLabel')}</label>
                    <textarea id="schemeDesc" value={description} onChange={e => setDescription(e.target.value)} required rows={3} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition" />
                </div>
                <div>
                    <label htmlFor="schemeIcon" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{t('adminSchemeIconLabel')}</label>
                    <select
                        id="schemeIcon"
                        value={icon}
                        onChange={e => setIcon(e.target.value)}
                        required
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition capitalize"
                    >
                        {SCHEME_ICONS.map(iconName => (
                            <option key={iconName} value={iconName}>
                                {iconName.replace('-', ' ')}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
            <div className="flex justify-end space-x-4 mt-6">
                <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg font-semibold transition-all duration-200 bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-100 hover:bg-slate-300 dark:hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400">{t('adminCancelButton')}</button>
                <button type="submit" className="px-4 py-2 rounded-lg font-semibold transition-all duration-200 bg-teal-600 text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">{t('adminAddButton')}</button>
            </div>
        </form>
    );
};

const PendingSchemeCard: React.FC<{
    scheme: AiScheme;
    onApprove: (scheme: AiScheme) => void;
    onDiscard: () => void;
}> = ({ scheme, onApprove, onDiscard }) => {
    const { t } = useTranslation();
    return (
        <li className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                 <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-500/20 rounded-full flex items-center justify-center">
                        <Icon icon={scheme.icon || 'light-bulb'} className="w-6 h-6 text-blue-500" />
                    </div>
                </div>
                <div className="flex-grow">
                    <h4 className="font-bold text-slate-800 dark:text-slate-100">{scheme.name}</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{scheme.description}</p>
                    {scheme.sourceUrl && <a href={scheme.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 dark:text-blue-400 hover:underline mt-1 inline-block">{t('adminSourceLink')}</a>}
                </div>
                 <div className="flex gap-2 flex-shrink-0 self-end sm:self-center">
                    <button onClick={() => onApprove(scheme)} className="px-3 py-1.5 text-sm font-semibold rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors flex items-center gap-1.5"><Icon icon="check-circle" className="w-4 h-4"/> {t('adminApproveButton')}</button>
                    <button onClick={onDiscard} className="px-3 py-1.5 text-sm font-semibold rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors flex items-center gap-1.5"><Icon icon="trash" className="w-4 h-4"/> {t('adminDiscardButton')}</button>
                </div>
            </div>
        </li>
    );
};

const UserDetailView: React.FC<{
    user: User & { username: string };
    details: { tracked: TrackedApplication[]; searches: SearchEvent[] };
    onBack: () => void;
}> = ({ user, details, onBack }) => {
    // FIX: Use `useTranslation` to get the language code for consistency with other components.
    const { lang } = useTranslation();
    return (
        <div>
            <button onClick={onBack} className="text-teal-600 dark:text-teal-400 hover:underline font-semibold transition-colors flex items-center gap-2 mb-4">
                <Icon icon="arrow-left" className="w-5 h-5" />
                Back to All Users
            </button>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700">
                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{user.firstName} {user.lastName}</h3>
                <p className="text-slate-500 dark:text-slate-400">@{user.username}</p>
                <div className="mt-6 space-y-6">
                    <div>
                        <h4 className="font-bold text-lg text-slate-700 dark:text-slate-200 mb-2">Tracked Applications ({details.tracked.length})</h4>
                        {details.tracked.length > 0 ? (
                            <ul className="space-y-3">
                                {details.tracked.map(app => (
                                    <li key={app.id} className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-md flex items-center gap-3">
                                        <Icon icon={app.schemeIcon} className="w-6 h-6 text-teal-500 flex-shrink-0"/>
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200 flex-grow">{app.schemeName[lang]}</span>
                                        <span className="text-xs text-slate-500 dark:text-slate-400">{app.status}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : <p className="text-sm text-slate-500 dark:text-slate-400">This user hasn't tracked any applications yet.</p>}
                    </div>
                     <div>
                        <h4 className="font-bold text-lg text-slate-700 dark:text-slate-200 mb-2">Search History ({details.searches.length})</h4>
                         {details.searches.length > 0 ? (
                            <ul className="space-y-3 max-h-60 overflow-y-auto">
                                {details.searches.map(search => (
                                    <li key={search.timestamp} className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-md text-sm">
                                        <p className="font-semibold text-slate-700 dark:text-slate-200">Searched on {new Date(search.timestamp).toLocaleDateString()}</p>
                                        <p className="text-slate-500 dark:text-slate-400">
                                            Criteria: {search.state}, {search.role}, Income ₹{search.income.toLocaleString('en-IN')}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        ) : <p className="text-sm text-slate-500 dark:text-slate-400">This user hasn't performed any searches yet.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};


const USERS_STORAGE_KEY = 'yogyatha-users';
type AdminTab = 'schemes' | 'analytics' | 'users';

interface AdminDashboardProps {
    schemes: Scheme[];
    onAddScheme: (scheme: Omit<Scheme, 'id' | 'score'>) => Promise<void>;
    onDeleteScheme: (schemeId: string) => Promise<void>;
    onLogout: () => void;
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
                    ? 'bg-white text-teal-600 shadow-sm dark:bg-slate-600 dark:text-white'
                    : 'text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
        >
            {children}
        </button>
    );
};


const AdminDashboard: React.FC<AdminDashboardProps> = ({ schemes, onAddScheme, onDeleteScheme, onLogout }) => {
    const { language, setLanguage } = useLanguage();
    const { t } = useTranslation();
    const [isAdding, setIsAdding] = useState(false);
    const [registeredUsers, setRegisteredUsers] = useState<{ [key: string]: User }>({});
    const [activeTab, setActiveTab] = useState<AdminTab>('schemes');
    
    const [isFindingSchemes, setIsFindingSchemes] = useState(false);
    const [pendingSchemes, setPendingSchemes] = useState<AiScheme[]>([]);
    const [aiError, setAiError] = useState<string | null>(null);
    const [searchTopic, setSearchTopic] = useState('education for girls');
    const [enrichingStates, setEnrichingStates] = useState<{ [key: string]: boolean }>({});
    const [syncState, setSyncState] = useState<'idle' | 'syncing' | 'synced'>('idle');

    const [schemeSearchQuery, setSchemeSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState<(User & { username: string }) | null>(null);
    const [selectedUserDetails, setSelectedUserDetails] = useState<{
        tracked: TrackedApplication[],
        searches: SearchEvent[]
    } | null>(null);
    const [isUserDetailsLoading, setIsUserDetailsLoading] = useState(false);


    useEffect(() => {
        const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
        if (storedUsers) {
            try { setRegisteredUsers(JSON.parse(storedUsers)); } 
            catch (e) { console.error("Failed to parse users from storage", e); }
        }
    }, []);

    useEffect(() => {
        if (selectedUser) {
            const fetchDetails = async () => {
                setIsUserDetailsLoading(true);
                const [tracked, searches] = await Promise.all([
                    api.getTrackedApplications(selectedUser.username),
                    api.getSearchHistoryForUser(selectedUser.username)
                ]);
                setSelectedUserDetails({ tracked, searches });
                setIsUserDetailsLoading(false);
            };
            fetchDetails();
        } else {
            setSelectedUserDetails(null); // Clear details when no user is selected
        }
    }, [selectedUser]);

    const handleFormSubmit = async (schemeData: Pick<Scheme, 'name' | 'description'> & { icon: string }) => {
        const newScheme: Omit<Scheme, 'id' | 'score'> = {
            ...schemeData,
            eligibility: { minAge: 18, maxAge: 60, maxIncome: 500000, states: ['Pan-India'], categories: ['General'], roles: ['Citizen'] },
            benefits: { en: ['New Benefit 1', 'New Benefit 2'], hi: [], te: [] },
            documents: { en: ['Aadhaar Card'], hi: [], te: [] },
            applyLink: '#',
        };
        await onAddScheme(newScheme);
        setIsAdding(false);
    };

    const handleDeleteClick = async (schemeId: string, schemeName: string) => {
        if (window.confirm(t('deleteSchemeConfirmation').replace('{schemeName}', schemeName))) {
            await onDeleteScheme(schemeId);
        }
    };

    const handleFindSchemes = async () => {
        setIsFindingSchemes(true);
        setAiError(null);
        setPendingSchemes([]);
        try {
            const newSchemes = await geminiService.findNewSchemes(searchTopic);
            setPendingSchemes(newSchemes);
        } catch (error) {
            setAiError(error instanceof Error ? error.message : "An unknown error occurred.");
        } finally {
            setIsFindingSchemes(false);
        }
    };

    const handleApproveScheme = async (schemeToApprove: AiScheme) => {
        const newScheme: Omit<Scheme, 'id' | 'score'> = {
            name: { en: schemeToApprove.name, hi: schemeToApprove.name, te: schemeToApprove.name },
            description: { en: schemeToApprove.description, hi: schemeToApprove.description, te: schemeToApprove.description },
            benefits: { en: schemeToApprove.benefits, hi: [], te: [] },
            documents: { en: schemeToApprove.documents, hi: [], te: [] },
            eligibility: schemeToApprove.eligibility,
            applyLink: schemeToApprove.applyLink,
            sourceUrl: schemeToApprove.sourceUrl,
            icon: schemeToApprove.icon,
        };
        await onAddScheme(newScheme);
        setPendingSchemes(prev => prev.filter(s => s.name !== schemeToApprove.name));
    };

    const handleDiscardScheme = (schemeToDiscard: AiScheme) => {
        setPendingSchemes(prev => prev.filter(s => s.name !== schemeToDiscard.name));
    };

    const handleEnrichScheme = async (scheme: Scheme) => {
        setEnrichingStates(prev => ({ ...prev, [scheme.id]: true }));
        try {
            const enrichedData = await geminiService.enrichSchemeWithAI(scheme);
            await api.updateScheme(scheme.id, enrichedData);
            // The parent `App` component will handle reloading the schemes list
        } catch (error) {
            console.error("Failed to enrich scheme:", error);
            // Optionally show an error to the admin
        } finally {
            setEnrichingStates(prev => ({ ...prev, [scheme.id]: false }));
        }
    };

    const handleSync = () => {
        setSyncState('syncing');
        setTimeout(() => {
            setSyncState('synced');
            setTimeout(() => {
                setSyncState('idle');
            }, 2000);
        }, 2000);
    };

    const userEntries = Object.entries(registeredUsers);

    const filteredSchemes = schemes.filter(scheme => {
        const query = schemeSearchQuery.toLowerCase();
        return (
            scheme.name.en.toLowerCase().includes(query) ||
            scheme.description.en.toLowerCase().includes(query)
        );
    });
    
    const TabButton: React.FC<{tab: AdminTab, children: React.ReactNode}> = ({tab, children}) => (
         <button 
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-semibold text-sm rounded-md transition-colors ${activeTab === tab ? 'bg-teal-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
        >
            {children}
        </button>
    )

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-900">
            <header className="bg-white dark:bg-slate-800 shadow-md sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">{t('adminDashboardTitle')}</h1>
                        <div className="flex items-center gap-2 mt-2">
                           <TabButton tab="schemes">{t('adminTabSchemes')}</TabButton>
                           <TabButton tab="analytics">{t('adminTabAnalytics')}</TabButton>
                           <TabButton tab="users">{t('adminTabUsers')}</TabButton>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={handleSync}
                            disabled={syncState !== 'idle'}
                            className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 text-slate-600 dark:text-slate-200 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 disabled:cursor-not-allowed"
                        >
                            {syncState === 'idle' && <><Icon icon="cloud-arrow-up" className="w-5 h-5" /> Sync to Cloud</>}
                            {syncState === 'syncing' && <><div className="w-5 h-5 border-2 border-slate-500 border-t-transparent rounded-full animate-spin"></div> Syncing...</>}
                            {syncState === 'synced' && <><Icon icon="check-circle" className="w-5 h-5 text-green-500" /> Synced!</>}
                        </button>
                        <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-900 rounded-lg p-1">
                           <LanguageButton targetLang={Language.EN} currentLang={language} onClick={setLanguage}>EN</LanguageButton>
                           <LanguageButton targetLang={Language.HI} currentLang={language} onClick={setLanguage}>हिं</LanguageButton>
                           <LanguageButton targetLang={Language.TE} currentLang={language} onClick={setLanguage}>తెలు</LanguageButton>
                        </div>
                        <button 
                            onClick={onLogout}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors bg-red-600 text-white hover:bg-red-700 shadow-sm"
                        >
                             <Icon icon="arrow-right-on-rectangle" className="w-5 h-5" />
                            {t('logout')}
                        </button>
                    </div>
                </div>
            </header>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <AnimatePresence mode="wait">
                 <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                 >
                    {activeTab === 'schemes' && (
                        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
                            <aside className="lg:col-span-4 xl:col-span-3">
                                <div className="sticky top-40 space-y-4">
                                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700">
                                        <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-4">{t('adminAiFinderTitle')}</h3>
                                        <div className="flex flex-col gap-4">
                                            <input type="text" value={searchTopic} onChange={e => setSearchTopic(e.target.value)} placeholder={t('adminAiFinderPlaceholder')} className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition" />
                                            <button onClick={handleFindSchemes} disabled={isFindingSchemes} className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-md disabled:bg-blue-400 disabled:cursor-wait">
                                                {isFindingSchemes ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Icon icon="magnifying-glass" className="w-5 h-5" />}
                                                {isFindingSchemes ? t('adminAiFinderSearching') : t('adminAiFinderButton')}
                                            </button>
                                        </div>
                                        {aiError && <p className="text-red-500 text-sm mt-4">{aiError}</p>}
                                    </div>
                                    {!isAdding && (
                                        <button onClick={() => setIsAdding(true)} className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 shadow-md transform hover:-translate-y-0.5">
                                            <Icon icon="plus" className="w-5 h-5" />
                                            {t('addNewScheme')}
                                        </button>
                                    )}
                                    <AnimatePresence>
                                        {isAdding && (
                                            <motion.div initial={{ opacity: 0, y: -20, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }} exit={{ opacity: 0, y: -20, height: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                                                <AddSchemeForm onSubmit={handleFormSubmit} onCancel={() => setIsAdding(false)} />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </aside>
                            <section className="lg:col-span-8 xl:col-span-9 mt-6 lg:mt-0">
                                <div className="space-y-8">
                                    {(isFindingSchemes || pendingSchemes.length > 0) && (
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-4">{t('adminPendingReviewTitle')} ({pendingSchemes.length})</h3>
                                            <ul className="space-y-4">
                                                {pendingSchemes.map((scheme, index) => (
                                                    <PendingSchemeCard key={`${scheme.name}-${index}`} scheme={scheme} onApprove={handleApproveScheme} onDiscard={() => handleDiscardScheme(scheme)} />
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                    <div>
                                        <div className="mb-6">
                                            <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-200">{t('manageSchemes')} ({filteredSchemes.length})</h2>
                                            <div className="mt-2 relative">
                                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                                    <Icon icon="magnifying-glass" className="h-5 w-5 text-slate-400" />
                                                </div>
                                                <input
                                                    type="search"
                                                    placeholder="Search by name or description..."
                                                    value={schemeSearchQuery}
                                                    onChange={e => setSchemeSearchQuery(e.target.value)}
                                                    className="w-full pl-10 pr-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition"
                                                />
                                            </div>
                                        </div>
                                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                                            <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                                                {filteredSchemes.map(scheme => (
                                                    <li key={scheme.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                                        <div className="flex items-start sm:items-center gap-4">
                                                            <div className="flex-shrink-0">
                                                                <div className="w-12 h-12 bg-teal-100 dark:bg-teal-500/20 rounded-full flex items-center justify-center">
                                                                    <Icon icon={scheme.icon || 'users'} className="w-6 h-6 text-teal-500" />
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <h3 className="font-bold text-slate-800 dark:text-slate-100">{scheme.name.en}</h3>
                                                                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-lg">{scheme.description.en.substring(0, 100)}...</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                                                            <button onClick={() => handleEnrichScheme(scheme)} disabled={enrichingStates[scheme.id]} className="p-2 text-slate-400 dark:text-slate-500 rounded-md hover:bg-blue-100 dark:hover:bg-blue-500/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors disabled:opacity-50 disabled:cursor-wait" title="Enrich with AI Translations">
                                                                {enrichingStates[scheme.id] ? <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div> : <Icon icon="sparkles" className="w-5 h-5" />}
                                                            </button>
                                                            <button onClick={() => handleDeleteClick(scheme.id, scheme.name.en)} className="p-2 text-slate-400 dark:text-slate-500 rounded-md hover:bg-red-100 dark:hover:bg-red-500/20 hover:text-red-600 dark:hover:text-red-400 transition-colors" title="Delete Scheme">
                                                                <Icon icon="trash" className="w-5 h-5" />
                                                            </button>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    )}
                    {activeTab === 'analytics' && <AdminAnalytics />}
                    {activeTab === 'users' && (
                         <AnimatePresence mode="wait">
                            {selectedUser ? (
                                <motion.div
                                    key="details"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {isUserDetailsLoading ? (
                                         <div className="text-center p-8"><div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div></div>
                                    ) : selectedUserDetails ? (
                                        <UserDetailView user={selectedUser} details={selectedUserDetails} onBack={() => setSelectedUser(null)} />
                                    ) : null}
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="list"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden border border-slate-200 dark:border-slate-700"
                                >
                                     <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                                         <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200">{t('adminRegisteredUsers')}</h2>
                                         <p className="text-sm text-slate-500 dark:text-slate-400">{t('adminTotalUsers')}: <span className="font-bold">{userEntries.length}</span></p>
                                     </div>
                                     <div className="overflow-x-auto">
                                         <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                                             <thead className="bg-slate-50 dark:bg-slate-700">
                                                 <tr>
                                                     <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">{t('adminFirstNameHeader')}</th>
                                                     <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">{t('adminLastNameHeader')}</th>
                                                     <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">{t('adminUsernameHeader')}</th>
                                                     <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">{t('adminEmailHeader')}</th>
                                                     <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">{t('adminMobileHeader')}</th>
                                                 </tr>
                                             </thead>
                                             <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                                                 {userEntries.length > 0 ? (
                                                     userEntries.map(([username, data]) => {
                                                        const user = data as User;
                                                        return (
                                                            <tr key={username} onClick={() => setSelectedUser({ ...user, username })} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors">
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">{user.firstName || ''}</td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">{user.lastName || ''}</td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{username}</td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{user.email || ''}</td>
                                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{user.mobile || ''}</td>
                                                            </tr>
                                                        );
                                                     })
                                                 ) : (
                                                     <tr><td colSpan={5} className="px-6 py-4 text-center text-sm text-slate-500 dark:text-slate-400">No registered users found.</td></tr>
                                                 )}
                                             </tbody>
                                         </table>
                                     </div>
                                </motion.div>
                            )}
                         </AnimatePresence>
                    )}
                 </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
};

export default AdminDashboard;