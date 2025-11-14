import React, { useState, useEffect, useCallback } from 'react';
import { Scheme, FormData } from '../types';
import { calculateAndFilterSchemes } from '../utils/scoring';
import { api } from '../services/api';
import Header from './Header';
import EligibilityForm from './EligibilityForm';
import Results from './Results';
import AiAssistant from './AiAssistant';
import UserProfile from './UserProfile';
import { motion, AnimatePresence } from 'framer-motion';

interface UserViewProps {
    initialSchemes: Scheme[];
    onLogout: () => void;
    username: string;
}

const UserView: React.FC<UserViewProps> = ({ initialSchemes, onLogout, username }) => {
    const [view, setView] = useState<'dashboard' | 'profile'>('dashboard');

    const initialFormData: FormData = {
        dob: '1999-01-01',
        income: 500000,
        state: 'Pan-India',
        category: 'General',
        role: 'Citizen',
        gender: 'Prefer not to say',
        documentsOwned: [],
    };
    
    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [filteredSchemes, setFilteredSchemes] = useState<Scheme[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    
    useEffect(() => {
        const loadProfile = async () => {
            const profile = await api.getUserProfile(username);
            if (profile) {
                setFormData(profile);
            }
        };
        loadProfile();
    }, [username]);
    
    const handleFormChange = (field: keyof FormData, value: string | number | string[]) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleFormReset = () => {
        setFormData(initialFormData);
        setFilteredSchemes([]);
        setHasSearched(false);
    };

    const handleSearch = useCallback(() => {
        setIsSearching(true);
        setHasSearched(true);
        // Simulate API delay for better UX
        setTimeout(() => {
            const results = calculateAndFilterSchemes(initialSchemes, formData, username);
            setFilteredSchemes(results);
            setIsSearching(false);
        }, 500);
    }, [initialSchemes, formData, username]);
    
    const handleSaveProfile = async (profileData: FormData) => {
        setFormData(profileData);
        await api.saveUserProfile(username, profileData);
    };

    const renderDashboard = () => (
        <>
            <div className="lg:grid lg:grid-cols-12 lg:gap-8">
                <aside className="lg:col-span-4 xl:col-span-3">
                    <div className="sticky top-24">
                        <EligibilityForm
                            formData={formData}
                            onChange={handleFormChange}
                            onReset={handleFormReset}
                            onSubmit={handleSearch}
                            isSearching={isSearching}
                        />
                    </div>
                </aside>
                <section className="lg:col-span-8 xl:col-span-9 mt-8 lg:mt-0">
                    {hasSearched ? (
                        <Results schemes={filteredSchemes} isLoading={isSearching} username={username}/>
                    ) : (
                         <div className="text-center py-16 px-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 flex flex-col items-center min-h-[400px] justify-center">
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Welcome, {username}!</h2>
                            <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-2">Fill out the form on the left to discover government schemes tailored for you.</p>
                        </div>
                    )}
                </section>
            </div>
            {filteredSchemes.length > 0 && <AiAssistant schemesContext={filteredSchemes} />}
        </>
    );

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-900">
            <Header onLogout={onLogout} username={username} onProfile={() => setView('profile')} />
             <AnimatePresence mode="wait">
                <motion.div
                    key={view}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                >
                    {view === 'dashboard' ? (
                        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                            {renderDashboard()}
                        </main>
                    ) : (
                        <UserProfile 
                            profile={formData} 
                            onSave={handleSaveProfile} 
                            onBack={() => setView('dashboard')}
                            username={username}
                        />
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default UserView;