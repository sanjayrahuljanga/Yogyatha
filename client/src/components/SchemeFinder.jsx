import React, { useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next'; // 🎯 Engine Imported
import Results from './Results';

const SchemeFinder = ({ user, onBack, schemes: propSchemes, onSaveScheme, onRemoveSavedScheme }) => {
  const { t } = useTranslation(); // 🎯 Engine Activated

  const [formData, setFormData] = useState({
    dob: user?.dateOfBirth || '',
    gender: user?.gender || '',
    occupation: user?.occupation || '',
    state: user?.state || '',
    category: user?.category || '',
    income: user?.netIncome || '',
    isDifferentlyAbled: user?.isDifferentlyAbled || '', 
  });

  const [schemes, setSchemes] = useState(propSchemes || []);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const states = [
    'All India', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Odisha', 'Punjab', 'Rajasthan', 
    'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal'
  ];

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const calculateExactAge = (dobString) => {
      if (!dobString) return null;
      const today = new Date();
      const birthDate = new Date(dobString);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDifference = today.getMonth() - birthDate.getMonth();
      if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
          age--;
      }
      return age;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSearching(true);
    setHasSearched(true);
    
    try {
      const res = await axios.get('http://localhost:5000/api/schemes');
      const allDbSchemes = res.data.schemes || [];
      const exactAge = calculateExactAge(formData.dob);

      const matchedSchemes = allDbSchemes.filter(scheme => {
          if (formData.state && scheme.state && scheme.state !== 'All India') {
              if (scheme.state.toLowerCase() !== formData.state.toLowerCase()) return false;
          }
          if (exactAge !== null && scheme.rules) {
              const min = scheme.rules.minAge || 0;
              const max = scheme.rules.maxAge || 100;
              if (exactAge < min || exactAge > max) return false;
          }
          if (formData.income && scheme.rules?.incomeLimit) {
              const userIncome = parseInt(formData.income);
              const limit = scheme.rules.incomeLimit;
              if (limit !== 99999999 && userIncome > limit) return false;
          }
          if (formData.gender && scheme.rules?.targetGender && scheme.rules.targetGender !== 'All') {
              const sGen = scheme.rules.targetGender.toLowerCase().replace('only', '').trim();
              let uGen = formData.gender.toLowerCase().trim();
              if (uGen === 'women') uGen = 'female';
              if (uGen === 'men') uGen = 'male';
              if (sGen !== uGen && sGen !== 'all') return false; 
          }
          if (formData.isDifferentlyAbled && scheme.rules?.targetDifferentlyAbled && scheme.rules.targetDifferentlyAbled !== 'All') {
              if (String(formData.isDifferentlyAbled) !== String(scheme.rules.targetDifferentlyAbled)) return false;
          }
          return true;
      });

      setSchemes(matchedSchemes);
    } catch (err) {
        console.error("Error fetching schemes:", err);
        alert("Failed to connect to the intelligence database.");
    } finally {
        setIsSearching(false);
    }
  };

  const inputStyle = "w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white text-gray-800 font-medium";

  return (
    <div className="bg-gray-50 pb-20 rounded-xl">
      <main className="max-w-6xl mx-auto mt-2">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 mb-10">
          <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">{t('sf_title')}</h2>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">{t('sf_dob')}</label>
              <input type="date" name="dob" value={formData.dob} onChange={handleInputChange} className={inputStyle} />
              {formData.dob && (
                  <p className="text-xs font-bold text-blue-600 mt-1 ml-1">
                      {t('sf_calc_age')}: {calculateExactAge(formData.dob)} {t('sf_years')}
                  </p>
              )}
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">{t('sf_state')}</label>
              <select name="state" value={formData.state} onChange={handleInputChange} className={inputStyle}>
                <option value="">{t('sf_select_state')}</option>
                {states.map(state => <option key={state} value={state}>{state}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">{t('sf_category')}</label>
              <select name="category" value={formData.category} onChange={handleInputChange} className={inputStyle}>
                <option value="">{t('sf_select_category')}</option>
                <option value="general">General</option>
                <option value="obc">OBC</option>
                <option value="sc">SC</option>
                <option value="st">ST</option>
                <option value="ews">EWS</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">{t('sf_income')}</label>
              <select name="income" value={formData.income} onChange={handleInputChange} className={inputStyle}>
                <option value="">{t('sf_select_income')}</option>
                <option value="50000">Below ₹1 Lakh</option>
                <option value="200000">₹1 Lakh - ₹3 Lakh</option>
                <option value="450000">₹3 Lakh - ₹6 Lakh</option>
                <option value="800000">₹6 Lakh - ₹10 Lakh</option>
                <option value="1500000">Above ₹10 Lakh</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">{t('sf_gender')}</label>
              <select name="gender" value={formData.gender} onChange={handleInputChange} className={inputStyle}>
                <option value="">{t('sf_select_gender')}</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">{t('sf_disabled')}</label>
              <select name="isDifferentlyAbled" value={formData.isDifferentlyAbled} onChange={handleInputChange} className={inputStyle}>
                <option value="">{t('sf_select_status')}</option>
                <option value="Yes">{t('sf_yes_disabled')}</option>
                <option value="No">{t('sf_no_general')}</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-semibold mb-2">{t('sf_occupation')}</label>
              <select name="occupation" value={formData.occupation} onChange={handleInputChange} className={inputStyle}>
                <option value="">{t('sf_select_occ')}</option>
                <option value="student">{t('sf_student')}</option>
                <option value="farmer">{t('sf_farmer')}</option>
                <option value="business">{t('sf_business')}</option>
                <option value="unemployed">{t('sf_unemployed')}</option>
              </select>
            </div>

            <div className="md:col-span-2 lg:col-span-3 mt-4">
                <button type="submit" disabled={isSearching} className={`w-full p-4 rounded-xl font-bold text-lg text-white transition-all shadow-lg hover:-translate-y-1 ${isSearching ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}>
                {isSearching ? t('sf_scanning') : t('sf_find')}
                </button>
            </div>
          </form>
        </div>

        {hasSearched && (
            <Results 
                schemes={schemes || []} 
                isLoading={isSearching} 
                onSaveScheme={onSaveScheme}
                onRemoveSavedScheme={onRemoveSavedScheme}
                isSavedView={false}
            />
        )}
      </main>
    </div>
  );
};

export default SchemeFinder;