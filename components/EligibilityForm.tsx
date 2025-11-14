import React, { useState, useEffect } from 'react';
import { type FormData } from '../types';
import { INDIAN_STATES, CATEGORIES, ROLES, GENDERS } from '../constants/options';
import { useTranslation } from '../hooks/useTranslation';
import Icon from './Icons';
import { getRelevantDocuments } from '../constants/documentMapping';

interface EligibilityFormProps {
    formData: FormData;
    onChange: (field: keyof FormData, value: string | number | string[]) => void;
    onReset: () => void;
    onSubmit: () => void;
    isSearching: boolean;
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
    <input {...props} className="w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition" />
);

const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
    <select {...props} className="w-full pl-10 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition appearance-none" />
);

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary', icon?: string }> = ({ children, variant = 'primary', icon, ...props }) => {
    const baseClasses = "w-full flex justify-center items-center gap-2 px-4 py-2.5 rounded-lg font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-sm transform hover:-translate-y-0.5";
    const variantClasses = {
        primary: "bg-teal-600 text-white hover:bg-teal-700 focus:ring-teal-500 disabled:bg-teal-400 disabled:cursor-not-allowed disabled:transform-none",
        secondary: "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 focus:ring-slate-400"
    };
    return (
        <button {...props} className={`${baseClasses} ${variantClasses[variant]}`}>
            {icon && !props.disabled && <Icon icon={icon} className="w-5 h-5" />}
             {props.disabled && <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
            {children}
        </button>
    );
};

const EligibilityForm: React.FC<EligibilityFormProps> = ({ formData, onChange, onReset, onSubmit, isSearching }) => {
    const { t } = useTranslation();
    const { dob, income, state, category, role, gender, documentsOwned } = formData;
    const [visibleDocuments, setVisibleDocuments] = useState<string[]>(() => getRelevantDocuments(formData.state));


    useEffect(() => {
        const newVisibleDocs = getRelevantDocuments(formData.state);
        setVisibleDocuments(newVisibleDocs);

        // Clean up selected documents that are no longer visible
        const currentOwned = formData.documentsOwned || [];
        const newOwnedDocs = currentOwned.filter(doc => newVisibleDocs.includes(doc));
        
        if (newOwnedDocs.length !== currentOwned.length) {
            onChange('documentsOwned', newOwnedDocs);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData.state]);

    const translatedCategories = {
        'General': t('categoryGeneral'),
        'SC': t('categorySC'),
        'ST': t('categoryST'),
        'OBC': t('categoryOBC'),
        'EWS': t('categoryEWS'),
    };
     const translatedRoles = {
        'Citizen': t('roleCitizen'),
        'Student': t('roleStudent'),
        'Farmer': t('roleFarmer'),
        'Entrepreneur': t('roleEntrepreneur'),
        'Job Seeker': t('roleJobSeeker'),
    };
     const translatedGenders = {
        'Female': t('genderFemale'),
        'Male': t('genderMale'),
        'Other': t('genderOther'),
        'Prefer not to say': t('genderPreferNotToSay'),
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit();
    };
    
    const handleDocChange = (doc: string, isChecked: boolean) => {
        const owned = documentsOwned || [];
        const newDocs = isChecked ? [...owned, doc] : owned.filter(d => d !== doc);
        onChange('documentsOwned', newDocs);
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 space-y-6">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-4">{t('eligibilityFormTitle')}</h2>

            {/* Date of Birth */}
            <div>
                <Label htmlFor="dob">{t('dateOfBirthLabel')}</Label>
                <InputGroup icon="calendar">
                    <Input
                        type="date"
                        id="dob"
                        value={dob}
                        onChange={(e) => onChange('dob', e.target.value)}
                        max={new Date().toISOString().split("T")[0]} // Prevent selecting future dates
                    />
                </InputGroup>
            </div>

            {/* Income */}
            <div>
                <Label htmlFor="income">{t('incomeLabel')}</Label>
                <InputGroup icon="currency-rupee">
                    <Input
                        type="number"
                        id="income"
                        value={income}
                        onChange={(e) => onChange('income', parseInt(e.target.value, 10))}
                    />
                </InputGroup>
            </div>
            
            {/* State */}
            <div>
                <Label htmlFor="state">{t('stateLabel')}</Label>
                 <InputGroup icon="map">
                    <Select id="state" value={state} onChange={(e) => onChange('state', e.target.value)}>
                        {INDIAN_STATES.map(s => <option key={s} value={s}>{s === 'Pan-India' ? t('statePanIndia') : s}</option>)}
                    </Select>
                </InputGroup>
            </div>

            {/* Category */}
            <div>
                <Label htmlFor="category">{t('categoryLabel')}</Label>
                <InputGroup icon="tag">
                    <Select id="category" value={category} onChange={(e) => onChange('category', e.target.value)}>
                        {CATEGORIES.map(c => <option key={c} value={c}>{translatedCategories[c]}</option>)}
                    </Select>
                </InputGroup>
            </div>

            {/* Role */}
            <div>
                <Label htmlFor="role">{t('roleLabel')}</Label>
                <InputGroup icon="briefcase">
                    <Select id="role" value={role} onChange={(e) => onChange('role', e.target.value)}>
                        {ROLES.map(r => <option key={r} value={r}>{translatedRoles[r] || r}</option>)}
                    </Select>
                </InputGroup>
            </div>

            {/* Gender */}
            <div>
                <Label htmlFor="gender">{t('genderLabel')}</Label>
                <InputGroup icon="users">
                    <Select id="gender" value={gender} onChange={(e) => onChange('gender', e.target.value)}>
                        {GENDERS.map(g => <option key={g} value={g}>{translatedGenders[g]}</option>)}
                    </Select>
                </InputGroup>
            </div>

            {/* Documents */}
            <details className="group pt-2">
                <summary className="flex justify-between items-center cursor-pointer list-none -mx-2 -my-1 p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700/50">
                    <span className="font-medium text-slate-600 dark:text-slate-300">My Documents (Optional)</span>
                    <Icon icon="chevron-down" className="w-5 h-5 text-slate-400 transition-transform group-open:rotate-180" />
                </summary>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 max-h-60 overflow-y-auto p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                    {visibleDocuments.map(doc => (
                        <label key={doc} className="flex items-center space-x-3">
                            <input
                                type="checkbox"
                                checked={(documentsOwned || []).includes(doc)}
                                onChange={e => handleDocChange(doc, e.target.checked)}
                                className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-slate-300 dark:border-slate-500 rounded bg-slate-100 dark:bg-slate-600"
                            />
                            <span className="text-sm text-slate-700 dark:text-slate-300">{doc}</span>
                        </label>
                    ))}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 italic">Selecting your documents helps improve scoring accuracy.</p>
            </details>

            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-4">
                <Button variant="secondary" onClick={onReset} type="button" icon="arrow-uturn-left">{t('resetButton')}</Button>
                <Button type="submit" variant="primary" disabled={isSearching} icon={'magnifying-glass'}>
                    {isSearching ? t('loading') : t('findSchemesButton')}
                </Button>
            </div>
        </form>
    );
};

export default EligibilityForm;