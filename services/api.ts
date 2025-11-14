import { DUMMY_SCHEMES } from '../constants/schemes';
import { Scheme, FormData, TrackedApplication, ApplicationStatus, Role } from '../types';

const SCHEMES_STORAGE_KEY = 'yogyatha-schemes';
const ANALYTICS_STORAGE_KEY = 'yogyatha-analytics';

// --- Scheme Management ---

const getStoredSchemes = (): Scheme[] => {
    const stored = localStorage.getItem(SCHEMES_STORAGE_KEY);
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (e) {
            console.error("Failed to parse schemes from localStorage", e);
            localStorage.setItem(SCHEMES_STORAGE_KEY, JSON.stringify(DUMMY_SCHEMES));
            return DUMMY_SCHEMES;
        }
    }
    localStorage.setItem(SCHEMES_STORAGE_KEY, JSON.stringify(DUMMY_SCHEMES));
    return DUMMY_SCHEMES;
};

const saveSchemes = (schemes: Scheme[]) => {
    localStorage.setItem(SCHEMES_STORAGE_KEY, JSON.stringify(schemes));
};


// --- User Profile Management ---
const getUserProfileKey = (username: string) => `yogyatha-profile-${username}`;

const getStoredUserProfile = (username: string): FormData | null => {
    const stored = localStorage.getItem(getUserProfileKey(username));
    return stored ? JSON.parse(stored) : null;
}

const saveStoredUserProfile = (username: string, profile: FormData) => {
    localStorage.setItem(getUserProfileKey(username), JSON.stringify(profile));
}

// --- Application Tracking ---
const getAppsKey = (username: string) => `yogyatha-apps-${username}`;

const getStoredTrackedApps = (username: string): TrackedApplication[] => {
    const stored = localStorage.getItem(getAppsKey(username));
    return stored ? JSON.parse(stored) : [];
}

const saveStoredTrackedApps = (username: string, apps: TrackedApplication[]) => {
    localStorage.setItem(getAppsKey(username), JSON.stringify(apps));
}

// --- Analytics ---
interface SearchEvent { username: string; state: string; role: Role; income: number; timestamp: number; }
interface TrackEvent { schemeId: string; schemeName: string, timestamp: number; }
interface AnalyticsData {
    searches: SearchEvent[];
    tracked: TrackEvent[];
}
const getAnalyticsData = (): AnalyticsData => {
     const stored = localStorage.getItem(ANALYTICS_STORAGE_KEY);
     return stored ? JSON.parse(stored) : { searches: [], tracked: [] };
}
const saveAnalyticsData = (data: AnalyticsData) => {
    localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(data));
}


export const api = {
    // SCHEMES
    getSchemes: (): Promise<Scheme[]> => Promise.resolve(getStoredSchemes()),
    addScheme: (newSchemeData: Omit<Scheme, 'id' | 'score'>): Promise<Scheme> => {
        const schemes = getStoredSchemes();
        const newScheme: Scheme = { ...newSchemeData, id: `custom-${new Date().getTime()}` };
        saveSchemes([...schemes, newScheme]);
        return Promise.resolve(newScheme);
    },
    updateScheme: (schemeId: string, updates: Partial<Scheme>): Promise<Scheme | null> => {
        const schemes = getStoredSchemes();
        let updatedScheme: Scheme | null = null;
        const updatedSchemes = schemes.map(s => {
            if (s.id === schemeId) {
                updatedScheme = { ...s, ...updates };
                return updatedScheme;
            }
            return s;
        });
        saveSchemes(updatedSchemes);
        return Promise.resolve(updatedScheme);
    },
    deleteScheme: (schemeId: string): Promise<boolean> => {
        let schemes = getStoredSchemes();
        const updatedSchemes = schemes.filter(s => s.id !== schemeId);
        const wasDeleted = schemes.length > updatedSchemes.length;
        if (wasDeleted) saveSchemes(updatedSchemes);
        return Promise.resolve(wasDeleted);
    },

    // USER PROFILE
    getUserProfile: (username: string): Promise<FormData | null> => Promise.resolve(getStoredUserProfile(username)),
    saveUserProfile: (username: string, profile: FormData): Promise<void> => {
        saveStoredUserProfile(username, profile);
        return Promise.resolve();
    },

    // APPLICATION TRACKING
    getTrackedApplications: (username: string): Promise<TrackedApplication[]> => Promise.resolve(getStoredTrackedApps(username)),
    trackApplication: (username: string, scheme: Scheme): Promise<TrackedApplication> => {
        const apps = getStoredTrackedApps(username);
        if (apps.some(app => app.schemeId === scheme.id)) {
            return Promise.reject(new Error("Application already tracked."));
        }
        const newApp: TrackedApplication = {
            id: `app-${new Date().getTime()}`,
            userId: username,
            schemeId: scheme.id,
            schemeName: scheme.name,
            schemeIcon: scheme.icon || 'document-text',
            applicationDate: new Date().toISOString().split('T')[0],
            status: 'Applied',
        };
        saveStoredTrackedApps(username, [...apps, newApp]);

        // Log analytics event
        const analytics = getAnalyticsData();
        analytics.tracked.push({ schemeId: scheme.id, schemeName: scheme.name.en, timestamp: Date.now() });
        saveAnalyticsData(analytics);
        
        return Promise.resolve(newApp);
    },
    updateApplicationStatus: (username: string, appId: string, status: ApplicationStatus): Promise<TrackedApplication | null> => {
        const apps = getStoredTrackedApps(username);
        let updatedApp: TrackedApplication | null = null;
        const updatedApps = apps.map(app => {
            if (app.id === appId) {
                updatedApp = { ...app, status };
                return updatedApp;
            }
            return app;
        });
        if(updatedApp) saveStoredTrackedApps(username, updatedApps);
        return Promise.resolve(updatedApp);
    },
    deleteTrackedApplication: (username: string, appId: string): Promise<boolean> => {
        const apps = getStoredTrackedApps(username);
        const updatedApps = apps.filter(app => app.id !== appId);
        const wasDeleted = apps.length > updatedApps.length;
        if (wasDeleted) saveStoredTrackedApps(username, updatedApps);
        return Promise.resolve(wasDeleted);
    },

    // ANALYTICS
    logSearchEvent: (username: string, formData: FormData): Promise<void> => {
        const analytics = getAnalyticsData();
        analytics.searches.push({ 
            username,
            state: formData.state, 
            role: formData.role, 
            income: formData.income,
            timestamp: Date.now() 
        });
        saveAnalyticsData(analytics);
        return Promise.resolve();
    },
    getAnalytics: (): Promise<AnalyticsData> => Promise.resolve(getAnalyticsData()),
    getSearchHistoryForUser: (username: string): Promise<SearchEvent[]> => {
        const analytics = getAnalyticsData();
        const userSearches = analytics.searches.filter(s => s.username === username);
        return Promise.resolve(userSearches.sort((a,b) => b.timestamp - a.timestamp));
    },
};