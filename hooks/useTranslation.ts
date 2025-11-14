import { translations } from '../constants/translations';
import { useLanguage } from '../context/LanguageContext';

type TranslationKey = keyof typeof translations['en'];

export const useTranslation = () => {
    const { language } = useLanguage();

    const t = (key: TranslationKey): string => {
        return translations[language][key] || translations['en'][key];
    };

    return { t, lang: language };
};