import { INDIAN_STATES } from './options';

// Using a Set to ensure uniqueness, then converting to a sorted array.
export const ALL_DOCUMENT_TYPES: string[] = Array.from(new Set([
    'Aadhaar Card',
    'PAN Card',
    'Passport size photo',
    'Land documents',
    'Caste Certificate',
    'Income Certificate',
    'Bonafide Certificate',
    'Startup Recognition Certificate',
    'Business Plan',
    'Proof of Residence',
    "Birth certificate of girl child",
    "Parent's identity proof",
    'Bank Account Details',
    'Bank Passbook',
    'Mobile Number',
    'Domicile Certificate',
    'Project Report',
    'Educational Qualification Certificate',
    'Unmarried Status Declaration',
    'Proof of School Enrollment',
    'Ration Card',
    'Medical Certificates',
    // From schemes
    'Company Incorporation documents',
    'Domicile Certificate of UP',
    'Maharashtra Domicile Certificate',
    'Detailed Project Report (DPR)',
    'Land records (RTC)',
    'Bhamashah Card',
    'Medical Certificates from a Government Doctor',
    'MA Card',
])).sort();


const COMMON_DOCUMENTS = [
    'Aadhaar Card', 'PAN Card', 'Passport size photo', 'Income Certificate',
    'Proof of Residence', 'Bank Account Details', 'Bank Passbook', 'Mobile Number',
    'Ration Card', 'Caste Certificate'
];

// Mapping of states to their specific additional documents, based on dummy schemes
const STATE_DOCUMENT_MAP: Record<string, string[]> = {
    'Telangana': ['Bonafide Certificate'],
    'Uttar Pradesh': ['Domicile Certificate of UP', 'Project Report', 'Educational Qualification Certificate'],
    'West Bengal': ["Birth certificate of girl child", 'Unmarried Status Declaration', 'Proof of School Enrollment'],
    'Maharashtra': ['Maharashtra Domicile Certificate', 'Detailed Project Report (DPR)'],
    'Karnataka': ['Land records (RTC)'],
    'Rajasthan': ['Bhamashah Card'],
    'Kerala': ['Medical Certificates from a Government Doctor'],
    'Gujarat': ['MA Card'],
    'Bihar': ["Birth certificate of girl child", 'Educational Qualification Certificate'],
};

/**
 * Gets a list of relevant documents for a given state.
 * @param state The selected state. 'Pan-India' returns all documents.
 * @returns An array of document names.
 */
export const getRelevantDocuments = (state: string): string[] => {
    if (state === 'Pan-India' || !INDIAN_STATES.includes(state) || !STATE_DOCUMENT_MAP[state]) {
        return ALL_DOCUMENT_TYPES;
    }

    const stateSpecificDocs = STATE_DOCUMENT_MAP[state] || [];
    const relevantDocs = new Set([...COMMON_DOCUMENTS, ...stateSpecificDocs]);
    return Array.from(relevantDocs).sort();
};
