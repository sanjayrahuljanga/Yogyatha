import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type FormData } from '../types';
import { INDIAN_STATES, CATEGORIES, ROLES, GENDERS } from '../constants/options';
import { ALL_DOCUMENT_TYPES } from '../constants/documentMapping';
import { useTranslation } from '../hooks/useTranslation';
import Icon from './Icons';
import ApplicationManager from './ApplicationManager';

interface UserProfileProps {
    profile: FormData | null;
    onSave: (profileData: FormData) => void;
    onBack: () => void;
    username: string;
}

const Label: React.FC<{ htmlFor: string, children: React.ReactNode }> = ({ htmlFor, children }) => (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{children}</label>
);

const InputGroup: React.FC<{ icon: string, children: React.ReactNode }> = ({ icon, children }) => (
    <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Icon icon={icon} className="h-5 w-5 text-slate-400" />
        </div>
        {children}
    </div>
);

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
    <input {...props} className="w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition" />
);

const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
    <select {...props} className="w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition appearance-none" />
);

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary', icon: string }> = ({ children, variant = 'primary', icon, ...props }) => {
    const baseClasses = "w-full flex justify-center items-center gap-2 px-4 py-2.5 rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-sm transform hover:-translate-y-0.5";
    const variantClasses = {
        primary: "bg-teal-600 text-white hover:bg-teal-700 focus:ring-teal-500 disabled:bg-teal-400",
        secondary: "bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-100 hover:bg-slate-300 dark:hover:bg-slate-500 focus:ring-slate-400"
    };
    return (
        <button {...props} className={`${baseClasses} ${variantClasses[variant]}`}>
            <Icon icon={icon} className="w-5 h-5" />
            {children}
        </button>
    );
};

const USERS_STORAGE_KEY = 'yogyatha-users';

const UserProfile: React.FC<UserProfileProps> = ({ profile, onSave, onBack, username }) => {
    const { t } = useTranslation();
    const initialFormData: FormData = {
        dob: '1999-01-01',
        income: 500000,
        state: 'Pan-India',
        category: 'General',
        role: 'Citizen',
        gender: 'Prefer not to say',
        documentsOwned: [],
    };

    const [formData, setFormData] = useState<FormData>(profile || initialFormData);
    const [saved, setSaved] = useState(false);
    
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [activeTab, setActiveTab] = useState<'details' | 'applications' | 'settings'>('details');

    const handleChange = (field: keyof FormData, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };
    
    const handleDocChange = (doc: string, isChecked: boolean) => {
        setFormData(prev => {
            const owned = prev.documentsOwned || [];
            const newDocs = isChecked ? [...owned, doc] : owned.filter(d => d !== doc);
            return { ...prev, documentsOwned: newDocs };
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const handlePasswordChange = (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess('');

        if (newPassword !== confirmPassword) {
            setPasswordError(t('passwordMismatchError'));
            return;
        }

        const storedUsers = JSON.parse(localStorage.getItem(USERS_STORAGE_KEY) || '{}');
        const currentUser = storedUsers[username];

        if (!currentUser || currentUser.password !== currentPassword) {
            setPasswordError(t('currentPasswordIncorrectError'));
            return;
        }
        
        const newUsers = { ...storedUsers, [username]: { ...currentUser, password: newPassword } };
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(newUsers));

        setPasswordSuccess(t('passwordUpdateSuccess'));
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setPasswordSuccess(''), 3000);
    };

    const translatedCategories = { 'General': t('categoryGeneral'), 'SC': t('categorySC'), 'ST': t('categoryST'), 'OBC': t('categoryOBC'), 'EWS': t('categoryEWS') };
    const translatedRoles = { 'Citizen': t('roleCitizen'), 'Student': t('roleStudent'), 'Farmer': t('roleFarmer'), 'Entrepreneur': t('roleEntrepreneur'), 'Job Seeker': t('roleJobSeeker') };
    const translatedGenders = { 'Female': t('genderFemale'), 'Male': t('genderMale'), 'Other': t('genderOther'), 'Prefer not to say': t('genderPreferNotToSay') };
    const { dob, income, state, category, role, gender, documentsOwned = [] } = formData;
    
    const TabButton: React.FC<{
        isActive: boolean;
        onClick: () => void;
        children: React.ReactNode;
        icon: string;
    }> = ({ isActive, onClick, children, icon }) => (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-4 sm:px-6 py-3 font-semibold text-sm rounded-t-lg transition-colors border-b-2 ${
                isActive
                    ? 'text-teal-600 dark:text-teal-400 border-teal-500'
                    : 'text-slate-500 dark:text-slate-400 border-transparent hover:border-slate-300 dark:hover:border-slate-600'
            }`}
        >
            <Icon icon={icon} className="w-5 h-5" />
            {children}
        </button>
    );

    return (
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-6">
                 <button onClick={onBack} className="text-teal-600 dark:text-teal-400 hover:underline font-semibold transition-colors flex items-center gap-2">
                    <Icon icon="arrow-left" className="w-5 h-5" />
                    {t('backToDashboard')}
                </button>
            </motion.div>
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="mb-6 border-b border-slate-200 dark:border-slate-700 flex">
                    <TabButton isActive={activeTab === 'details'} onClick={() => setActiveTab('details')} icon="user-circle">
                        {t('profileTabDetails')}
                    </TabButton>
                    <TabButton isActive={activeTab === 'applications'} onClick={() => setActiveTab('applications')} icon="document-text">
                        {t('profileTabApplications')}
                    </TabButton>
                    <TabButton isActive={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon="cog-8-tooth">
                        {t('profileTabSettings')}
                    </TabButton>
                </div>
                
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {activeTab === 'details' && (
                            <div className="space-y-8 max-w-2xl mx-auto">
                                <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 space-y-6">
                                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-4">{t('userProfileTitle')}</h2>
                                    
                                    <div><Label htmlFor="dob">{t('dateOfBirthLabel')}</Label><InputGroup icon="calendar"><Input type="date" id="dob" value={dob} onChange={(e) => handleChange('dob', e.target.value)} max={new Date().toISOString().split("T")[0]}/></InputGroup></div>
                                    <div><Label htmlFor="income">{t('incomeLabel')}</Label><InputGroup icon="currency-rupee"><Input type="number" id="income" value={income} onChange={(e) => handleChange('income', parseInt(e.target.value, 10))}/></InputGroup></div>
                                    <div><Label htmlFor="state">{t('stateLabel')}</Label><InputGroup icon="map"><Select id="state" value={state} onChange={(e) => handleChange('state', e.target.value)}>{INDIAN_STATES.map(s => <option key={s} value={s}>{s === 'Pan-India' ? t('statePanIndia') : s}</option>)}</Select></InputGroup></div>
                                    <div><Label htmlFor="category">{t('categoryLabel')}</Label><InputGroup icon="tag"><Select id="category" value={category} onChange={(e) => handleChange('category', e.target.value)}>{CATEGORIES.map(c => <option key={c} value={c}>{translatedCategories[c]}</option>)}</Select></InputGroup></div>
                                    <div><Label htmlFor="role">{t('roleLabel')}</Label><InputGroup icon="briefcase"><Select id="role" value={role} onChange={(e) => handleChange('role', e.target.value)}>{ROLES.map(r => <option key={r} value={r}>{translatedRoles[r] || r}</option>)}</Select></InputGroup></div>
                                    <div><Label htmlFor="gender">{t('genderLabel')}</Label><InputGroup icon="users"><Select id="gender" value={gender} onChange={(e) => handleChange('gender', e.target.value)}>{GENDERS.map(g => <option key={g} value={g}>{translatedGenders[g]}</option>)}</Select></InputGroup></div>

                                    <div>
                                        <Label htmlFor="documents">My Documents (Check all you have)</Label>
                                        <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2 max-h-60 overflow-y-auto p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                                           {ALL_DOCUMENT_TYPES.map(doc => (
                                               <label key={doc} className="flex items-center space-x-3">
                                                   <input type="checkbox" checked={documentsOwned.includes(doc)} onChange={e => handleDocChange(doc, e.target.checked)} className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-slate-300 dark:border-slate-500 rounded bg-slate-100 dark:bg-slate-600" />
                                                   <span className="text-sm text-slate-700 dark:text-slate-300">{doc}</span>
                                               </label>
                                           ))}
                                        </div>
                                    </div>

                                    <div className="pt-4">
                                        <Button variant="primary" type="submit" icon="check-circle">{t('saveProfileButton')}</Button>
                                    </div>
                                    {saved && <p className="text-green-600 text-center mt-4 font-semibold">Profile saved successfully!</p>}
                                </form>
                            </div>
                        )}

                        {activeTab === 'applications' && (
                            <ApplicationManager username={username} />
                        )}

                        {activeTab === 'settings' && (
                             <div className="space-y-8 max-w-2xl mx-auto">
                                <form onSubmit={handlePasswordChange} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 space-y-6">
                                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-4">{t('changePasswordTitle')}</h2>
                                    <div><Label htmlFor="currentPassword">{t('currentPasswordLabel')}</Label><InputGroup icon="lock-closed"><Input type="password" id="currentPassword" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required /></InputGroup></div>
                                    <div><Label htmlFor="newPassword">{t('newPasswordLabel')}</Label><InputGroup icon="lock-closed"><Input type="password" id="newPassword" value={newPassword} onChange={e => setNewPassword(e.target.value)} required /></InputGroup></div>
                                    <div><Label htmlFor="confirmPassword">{t('confirmPasswordLabel')}</Label><InputGroup icon="lock-closed"><Input type="password" id="confirmPassword" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required /></InputGroup></div>
                                    <div className="pt-4"><Button variant="primary" type="submit" icon="check-circle">{t('changePasswordButton')}</Button></div>
                                    {passwordError && <p className="text-red-500 text-center mt-2 text-sm">{passwordError}</p>}
                                    {passwordSuccess && <p className="text-green-600 text-center mt-2 text-sm">{passwordSuccess}</p>}
                                </form>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </motion.div>
        </main>
    );
};

export default UserProfile;