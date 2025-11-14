import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../hooks/useTranslation';
import Header from './Header';
import Icon from './Icons';

interface AuthPageProps {
    onLogin: (role: 'user' | 'admin', username: string, rememberMe: boolean) => void;
}

const USERS_STORAGE_KEY = 'yogyatha-users';
const DEMO_OTP = '123456'; // Static OTP for demonstration purposes

const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
    const { t } = useTranslation();
    const [view, setView] = useState<'login' | 'signup' | 'forgot_username' | 'forgot_otp'>('login');
    
    // Form fields
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [countryCode, setCountryCode] = useState('+91');
    const [mobile, setMobile] = useState('');
    const [confirmPassword, setConfirmPassword] = useState(''); // Used for signup and reset
    const [newPassword, setNewPassword] = useState(''); // Used for reset only
    const [otp, setOtp] = useState('');

    const [loginRole, setLoginRole] = useState<'user' | 'admin'>('user');
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const resetFormState = () => {
        setUsername('');
        setPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setOtp('');
        setError('');
        setSuccess('');
        setFirstName('');
        setLastName('');
        setEmail('');
        setCountryCode('+91');
        setMobile('');
    };

    const handleViewChange = (newView: 'login' | 'signup' | 'forgot_username') => {
        setView(newView);
        resetFormState();
    };
    
    const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const numericValue = e.target.value.replace(/[^0-9]/g, '');
        setMobile(numericValue);
    };

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (loginRole === 'admin') {
            // Temporarily allow any non-empty credentials for admin login
            if (username.trim() && password.trim()) {
                onLogin('admin', username, rememberMe);
                return;
            }
        } else {
            const storedUsers = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '{}');
            if (storedUsers[username] && storedUsers[username].password === password) {
                onLogin('user', username, rememberMe);
                return;
            }
        }
        setError(t('authErrorInvalid'));
    };
    
    const handleSignup = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (password !== confirmPassword) {
            setError(t('passwordMismatchError'));
            return;
        }

        if (countryCode === '+91' && mobile.length !== 10) {
            setError(t('authErrorInvalidMobile'));
            return;
        }

        const storedUsers = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '{}');
        if (storedUsers[username] || username === 'admin') {
            setError(t('authErrorExists'));
        } else {
            const newUsers = { 
                ...storedUsers, 
                [username]: { 
                    password, 
                    firstName, 
                    lastName, 
                    email, 
                    mobile: `${countryCode} ${mobile}` 
                } 
            };
            localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(newUsers));
            setSuccess(t('authSuccess'));
            handleViewChange('login');
        }
    };
    
    const maskEmail = (email = '') => {
        if (!email.includes('@')) return '******';
        const [name, domain] = email.split('@');
        if (!domain.includes('.')) return `${name.charAt(0)}***@***`;
        const [domainName, domainTld] = domain.split('.');
        return `${name.charAt(0)}***@${domainName.charAt(0)}***.${domainTld}`;
    }
    const maskMobile = (mobile = '') => {
        if (mobile.length < 4) return '******';
        return `******${mobile.slice(-4)}`;
    }

    const handleSendOtp = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        const storedUsers = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '{}');
        const user = storedUsers[username];
        if (user) {
            let message = t('otpSentSuccess'); // "OTP sent! For demo purposes, your OTP is:"
            if (user.email && user.mobile) {
                const maskedEmail = maskEmail(user.email);
                const maskedMobile = maskMobile(user.mobile);
                message = message.replace('!', ` to ${maskedEmail} & ${maskedMobile}!`);
            }
            setSuccess(message);
            setView('forgot_otp');
        } else {
            setError(t('userNotFound'));
        }
    };

    const handleResetPassword = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (newPassword !== confirmPassword) {
            setError(t('passwordMismatchError'));
            return;
        }
        if (otp !== DEMO_OTP) {
            setError(t('otpInvalidError'));
            return;
        }

        const storedUsers = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '{}');
        if (storedUsers[username]) {
            const updatedUsers = { ...storedUsers, [username]: { ...storedUsers[username], password: newPassword } };
            localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
            setSuccess(t('passwordResetSuccess'));
            handleViewChange('login');
        } else {
            setError(t('userNotFound')); // Should not happen if flow is correct
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
            <Header />
            <div className="flex-grow flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-md"
                >
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
                        <div className="p-8 pb-0 flex flex-col items-center">
                            <div className="bg-teal-100 dark:bg-teal-500/20 p-4 rounded-full">
                                <Icon icon="shield-check" className="w-16 h-16 text-teal-500" />
                            </div>
                        </div>
                        {view !== 'forgot_username' && view !== 'forgot_otp' && (
                           <div className="p-2 mt-6">
                                <div className="flex bg-slate-100 dark:bg-slate-900 rounded-lg p-1 relative">
                                    <motion.div 
                                        layoutId="auth-tab"
                                        className="absolute inset-0 bg-white dark:bg-slate-700 rounded-md shadow-sm"
                                        transition={{type: 'spring', stiffness: 300, damping: 30}}
                                        style={{
                                            left: view === 'login' ? '0.25rem' : '50%',
                                            right: view === 'signup' ? '0.25rem' : '50%',
                                        }}
                                    />
                                    <button
                                        onClick={() => handleViewChange('login')}
                                        className={`w-1/2 p-2.5 font-bold text-center transition-colors relative z-10 rounded-md ${view === 'login' ? 'text-teal-600 dark:text-white' : 'text-slate-500 dark:text-slate-300 hover:text-slate-700 dark:hover:text-white'}`}
                                    >
                                        {t('loginTitle')}
                                    </button>
                                    <button
                                        onClick={() => handleViewChange('signup')}
                                        className={`w-1/2 p-2.5 font-bold text-center transition-colors relative z-10 rounded-md ${view === 'signup' ? 'text-teal-600 dark:text-white' : 'text-slate-500 dark:text-slate-300 hover:text-slate-700 dark:hover:text-white'}`}
                                    >
                                        {t('signupTitle')}
                                    </button>
                                </div>
                            </div>
                        )}
                        <div className="p-8">
                            <AnimatePresence mode="wait">
                                {view === 'login' && (
                                    <motion.form key="login" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }} transition={{ duration: 0.3 }} onSubmit={handleLogin} className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t('loginAsLabel')}</label>
                                            <div className="flex rounded-md shadow-sm">
                                                <button type="button" onClick={() => setLoginRole('user')} className={`px-4 py-2 w-1/2 rounded-l-lg border text-sm font-medium transition-colors ${loginRole === 'user' ? 'bg-teal-600 text-white border-teal-600' : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600'}`}>{t('roleUser')}</button>
                                                <button type="button" onClick={() => setLoginRole('admin')} className={`px-4 py-2 w-1/2 rounded-r-lg border text-sm font-medium transition-colors ${loginRole === 'admin' ? 'bg-teal-600 text-white border-teal-600' : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600'}`}>{t('roleAdmin')}</button>
                                            </div>
                                        </div>
                                        <div>
                                            <label htmlFor="username-login" className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('usernameLabel')}</label>
                                            <div className="mt-1 relative"><div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><Icon icon="user" className="h-5 w-5 text-slate-400" /></div><input id="username-login" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required className="w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition" /></div>
                                        </div>
                                        <div>
                                            <label htmlFor="password-login" className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('passwordLabel')}</label>
                                            <div className="mt-1 relative"><div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><Icon icon="lock-closed" className="h-5 w-5 text-slate-400" /></div><input id="password-login" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition" /></div>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center"><input id="remember-me" name="remember-me" type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-slate-300 dark:border-slate-600 rounded bg-slate-100 dark:bg-slate-700" /><label htmlFor="remember-me" className="ml-2 block text-sm text-slate-700 dark:text-slate-300">{t('rememberMe')}</label></div>
                                            <div className="text-sm"><button type="button" onClick={() => handleViewChange('forgot_username')} className="font-semibold text-teal-600 hover:text-teal-500">{t('forgotPasswordLink')}</button></div>
                                        </div>
                                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                                        {success && <p className="text-green-500 text-sm text-center">{success}</p>}
                                        <button type="submit" className="w-full px-4 py-3 bg-teal-600 text-white font-bold rounded-lg shadow-md hover:bg-teal-700 transition-all transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2">{t('loginButton')}</button>
                                    </motion.form>
                                )}
                                {view === 'signup' && (
                                    <motion.form key="signup" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }} onSubmit={handleSignup} className="space-y-4">
                                        <div className="flex flex-col sm:flex-row gap-4">
                                            <div className="flex-1">
                                                <label htmlFor="firstName-signup" className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('firstNameLabel')}</label>
                                                <div className="mt-1 relative"><div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><Icon icon="user" className="h-5 w-5 text-slate-400" /></div><input id="firstName-signup" type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required className="w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition" /></div>
                                            </div>
                                            <div className="flex-1">
                                                <label htmlFor="lastName-signup" className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('lastNameLabel')}</label>
                                                <div className="mt-1 relative"><div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><Icon icon="user" className="h-5 w-5 text-slate-400" /></div><input id="lastName-signup" type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required className="w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition" /></div>
                                            </div>
                                        </div>
                                        <div>
                                            <label htmlFor="email-signup" className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('emailLabel')}</label>
                                            <div className="mt-1 relative"><div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><Icon icon="at-symbol" className="h-5 w-5 text-slate-400" /></div><input id="email-signup" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition" /></div>
                                        </div>
                                        <div>
                                            <label htmlFor="mobile-signup" className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('mobileLabel')}</label>
                                            <div className="mt-1 flex gap-2">
                                                <select
                                                    value={countryCode}
                                                    onChange={(e) => setCountryCode(e.target.value)}
                                                    className="px-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition"
                                                    aria-label="Country Code"
                                                >
                                                    <option value="+91">IN +91</option>
                                                </select>
                                                <div className="relative flex-grow">
                                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><Icon icon="phone" className="h-5 w-5 text-slate-400" /></div>
                                                    <input id="mobile-signup" type="tel" inputMode="numeric" pattern="[0-9]*" value={mobile} onChange={handleMobileChange} required className="w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition" />
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <label htmlFor="username-signup" className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('usernameLabel')}</label>
                                            <div className="mt-1 relative"><div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><Icon icon="user" className="h-5 w-5 text-slate-400" /></div><input id="username-signup" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required className="w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition" /></div>
                                        </div>
                                        <div>
                                            <label htmlFor="password-signup" className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('passwordLabel')}</label>
                                            <div className="mt-1 relative"><div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><Icon icon="lock-closed" className="h-5 w-5 text-slate-400" /></div><input id="password-signup" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition" /></div>
                                        </div>
                                        <div>
                                            <label htmlFor="confirm-password-signup" className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('reEnterPasswordLabel')}</label>
                                            <div className="mt-1 relative"><div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><Icon icon="lock-closed" className="h-5 w-5 text-slate-400" /></div><input id="confirm-password-signup" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition" /></div>
                                        </div>
                                        {error && <p className="text-red-500 text-sm text-center pt-2">{error}</p>}
                                        <button type="submit" className="w-full px-4 py-3 bg-teal-600 text-white font-bold rounded-lg shadow-md hover:bg-teal-700 transition-all transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 mt-6">{t('signupButton')}</button>
                                    </motion.form>
                                )}
                                {view === 'forgot_username' && (
                                    <motion.div key="forgot_username" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.3 }}>
                                        <h3 className="text-center text-xl font-bold text-slate-800 dark:text-slate-100">{t('forgotPasswordTitle')}</h3>
                                        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-2 mb-6">{t('enterUsernameForOtpPrompt')}</p>
                                        <form onSubmit={handleSendOtp} className="space-y-6">
                                            <div>
                                                <label htmlFor="username-recover" className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('usernameLabel')}</label>
                                                <div className="mt-1 relative"><div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><Icon icon="user" className="h-5 w-5 text-slate-400" /></div><input id="username-recover" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required className="w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition" /></div>
                                            </div>
                                            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                                            <button type="submit" className="w-full px-4 py-3 bg-teal-600 text-white font-bold rounded-lg shadow-md hover:bg-teal-700 transition-all transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2">{t('sendOtpButton')}</button>
                                        </form>
                                        <div className="mt-6 text-center"><button onClick={() => handleViewChange('login')} className="font-semibold text-teal-600 hover:text-teal-500 text-sm flex items-center justify-center gap-1 mx-auto"><Icon icon="arrow-left" className="w-4 h-4" />{t('backToLogin')}</button></div>
                                    </motion.div>
                                )}
                                {view === 'forgot_otp' && (
                                    <motion.div key="forgot_otp" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.3 }}>
                                        <h3 className="text-center text-xl font-bold text-slate-800 dark:text-slate-100">{t('resetPasswordButton')}</h3>
                                        {success && <div className="text-green-800 dark:text-green-200 text-sm text-center bg-green-100 dark:bg-green-500/20 p-3 my-4 rounded-lg border border-green-200 dark:border-green-500/30">{success}{' '}<strong className="font-mono bg-green-200 dark:bg-green-500/30 px-2 py-1 rounded">{DEMO_OTP}</strong></div>}
                                        <form onSubmit={handleResetPassword} className="space-y-6">
                                            <div>
                                                <label htmlFor="otp-recover" className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('enterOtpLabel')}</label>
                                                <div className="mt-1 relative"><div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><Icon icon="key" className="h-5 w-5 text-slate-400" /></div><input id="otp-recover" type="text" value={otp} onChange={(e) => setOtp(e.target.value)} required className="w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition" /></div>
                                            </div>
                                            <div>
                                                <label htmlFor="new-password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('newPasswordLabel')}</label>
                                                <div className="mt-1 relative"><div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><Icon icon="lock-closed" className="h-5 w-5 text-slate-400" /></div><input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className="w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition" /></div>
                                            </div>
                                             <div>
                                                <label htmlFor="confirm-password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('confirmPasswordLabel')}</label>
                                                <div className="mt-1 relative"><div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><Icon icon="lock-closed" className="h-5 w-5 text-slate-400" /></div><input id="confirm-password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition" /></div>
                                            </div>
                                            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                                            <button type="submit" className="w-full px-4 py-3 bg-teal-600 text-white font-bold rounded-lg shadow-md hover:bg-teal-700 transition-all transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2">{t('resetPasswordButton')}</button>
                                        </form>
                                        <div className="mt-6 text-center"><button onClick={() => handleViewChange('login')} className="font-semibold text-teal-600 hover:text-teal-500 text-sm flex items-center justify-center gap-1 mx-auto"><Icon icon="arrow-left" className="w-4 h-4" />{t('backToLogin')}</button></div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default AuthPage;