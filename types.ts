// FIX: Removed circular self-import of `Language` which caused compilation errors.

export enum Language {
    EN = 'en',
    HI = 'hi',
    TE = 'te',
}

export type Category = 'General' | 'SC' | 'ST' | 'OBC' | 'EWS';
export type Role = 'Citizen' | 'Student' | 'Farmer' | 'Entrepreneur' | 'Job Seeker';
export type Gender = 'Female' | 'Male' | 'Other' | 'Prefer not to say';

export interface FormData {
    dob: string; // YYYY-MM-DD format
    income: number;
    state: string;
    category: Category;
    role: Role;
    gender: Gender;
    documentsOwned: string[];
}

export interface Scheme {
    id: string;
    icon?: string; // e.g., 'academic-cap', 'leaf', 'light-bulb'
    name: { [key in Language]: string };
    description: { [key in Language]: string };
    eligibility: {
        minAge: number;
        maxAge: number;
        maxIncome: number;
        states: string[];
        categories: Category[];
        roles: Role[];
        genders?: Gender[];
    };
    benefits: { [key in Language]: string[] };
    documents: { [key in Language]: string[] };
    applyLink: string;
    sourceUrl?: string;
    score?: number;
    easySummary?: { [key in Language]?: string };
}


export type ApplicationStatus = 'Applied' | 'In Review' | 'Documents Requested' | 'Approved' | 'Rejected';

export interface TrackedApplication {
    id: string;
    userId: string;
    schemeId: string;
    schemeName: { [key in Language]: string };
    schemeIcon: string;
    applicationDate: string;
    status: ApplicationStatus;
    applicationNumber?: string;
    notes?: string;
}

export interface User {
    password: string;
    firstName: string;
    lastName: string;
    email: string;
    mobile: string;
}