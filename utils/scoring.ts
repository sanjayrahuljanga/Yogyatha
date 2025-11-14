import { type FormData, type Scheme } from '../types';
import { api } from '../services/api';

const MIN_SCORE = 5;

const calculateAge = (dob: string): number => {
    if (!dob) return 0;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
};

export const calculateAndFilterSchemes = (schemes: Scheme[], formData: FormData, username: string): Scheme[] => {
    // Log the search event for analytics, now with the user context
    api.logSearchEvent(username, formData);
    
    const age = calculateAge(formData.dob);

    const scoredSchemes = schemes.map(scheme => {
        const stateMatch = scheme.eligibility.states.includes('Pan-India') || scheme.eligibility.states.includes(formData.state);
        const categoryMatch = scheme.eligibility.categories.includes(formData.category);

        // If state or category doesn't match, it's not eligible, score is 0.
        if (!stateMatch || !categoryMatch) {
            return { ...scheme, score: 0 };
        }

        let score = 0;

        // Age: +3 points
        if (age >= scheme.eligibility.minAge && age <= scheme.eligibility.maxAge) {
            score += 3;
        }

        // Income: +2 points
        if (formData.income <= scheme.eligibility.maxIncome) {
            score += 2;
        }

        // State: +2 points (already matched)
        score += 2;

        // Category: +2 points (already matched)
        score += 2;

        // Role: +2 points
        if (scheme.eligibility.roles.includes(formData.role)) {
            score += 2;
        }

        return { ...scheme, score };
    });

    return scoredSchemes
        .filter(scheme => scheme.score >= MIN_SCORE)
        .sort((a, b) => (b.score || 0) - (a.score || 0));
};