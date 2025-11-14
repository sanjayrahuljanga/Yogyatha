import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LanguageProvider } from './context/LanguageContext';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import UserView from './components/UserView';
import AdminDashboard from './components/AdminDashboard';
import { type Scheme } from './types';
import { api } from './services/api';

type UserRole = 'user' | 'admin';
type View = 'landing' | 'auth' | 'user' | 'admin';

const App: React.FC = () => {
    const [view, setView] = useState<View>('landing');
    const [userRole, setUserRole] = useState<UserRole | null>(null);
    const [username, setUsername] = useState<string | null>(null);
    const [allSchemes, setAllSchemes] = useState<Scheme[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const checkSession = async () => {
            const session = localStorage.getItem('yogyatha-session') || sessionStorage.getItem('yogyatha-session');
            if (session) {
                const { role, user } = JSON.parse(session);
                setUserRole(role);
                setUsername(user);
                setView(role);
            }
            await loadSchemes();
            setIsLoading(false);
        };
        checkSession();
    }, []);

    const loadSchemes = async () => {
        const fetchedSchemes = await api.getSchemes();
        setAllSchemes(fetchedSchemes);
    };

    const handleLogin = (role: UserRole, user: string, rememberMe: boolean) => {
        const sessionData = JSON.stringify({ role, user });
        if (rememberMe) {
            localStorage.setItem('yogyatha-session', sessionData);
        } else {
            sessionStorage.setItem('yogyatha-session', sessionData);
        }
        setUserRole(role);
        setUsername(user);
        setView(role);
    };

    const handleLogout = () => {
        localStorage.removeItem('yogyatha-session');
        sessionStorage.removeItem('yogyatha-session');
        setUserRole(null);
        setUsername(null);
        setView('landing');
    };
    
    const handleAddScheme = async (schemeData: Omit<Scheme, 'id' | 'score'>) => {
        await api.addScheme(schemeData);
        await loadSchemes(); // Refresh the list
    };

    const handleDeleteScheme = async (schemeId: string) => {
        await api.deleteScheme(schemeId);
        await loadSchemes(); // Refresh the list
    };


    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="mt-4 text-lg font-semibold text-slate-700 dark:text-slate-200">Loading...</p>
                    </div>
                </div>
            );
        }

        switch (view) {
            case 'auth':
                return <AuthPage onLogin={handleLogin} />;
            case 'user':
                return <UserView initialSchemes={allSchemes} onLogout={handleLogout} username={username!} />;
            case 'admin':
                return <AdminDashboard schemes={allSchemes} onAddScheme={handleAddScheme} onDeleteScheme={handleDeleteScheme} onLogout={handleLogout} />;
            case 'landing':
            default:
                return <LandingPage onNavigateToAuth={() => setView('auth')} />;
        }
    };

    return (
        <LanguageProvider>
            <AnimatePresence mode="wait">
                <motion.div
                    key={view}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {renderContent()}
                </motion.div>
            </AnimatePresence>
        </LanguageProvider>
    );
};

export default App;
