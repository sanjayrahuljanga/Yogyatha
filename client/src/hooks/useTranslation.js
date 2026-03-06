import { useState, useEffect } from 'react';

const translations = {
  loading: 'Loading...',
  resultsTitle: 'Available Schemes',
  noResultsMessage: 'No schemes found matching your criteria.',
  findSchemes: 'Find Schemes',
  yourInfo: 'Your Info',
  savedSchemes: 'Saved Schemes',
  applicationStatus: 'Application Status',
  notifications: 'Notifications',
  helpSupport: 'Help & Support',
  viewDetails: 'View Details',
  applyNow: 'Apply Now',
  saveForLater: 'Save for Later'
};

const useTranslation = () => {
  const [language, setLanguage] = useState('en');

  const t = (key) => {
    return translations[key] || key;
  };

  return { t, language, setLanguage };
};

export default useTranslation;
