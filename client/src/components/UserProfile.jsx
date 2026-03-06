import React, { useState } from 'react';
import { useTranslation } from 'react-i18next'; // 🎯 Engine Imported

const UserProfile = ({ user, onUpdateUser, onBack }) => {
  const { t } = useTranslation(); // 🎯 Engine Activated

  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    phone: user.phone || '',
    dateOfBirth: '', 
    calculatedAge: '', 
    gender: user.gender || '',
    state: user.state || '',
    category: user.category || '',
    netIncome: user.netIncome || '',
    isDifferentlyAbled: user.isDifferentlyAbled || '', 
    password: '',
    confirmPassword: ''
  });

  const states = [
    'All India',
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
  ];

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    
    if (e.target.name === 'dateOfBirth') {
      const birthDate = new Date(e.target.value);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      setFormData(prev => ({ ...prev, calculatedAge: age.toString() }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedUser = {
      ...user,
      ...formData
    };
    onUpdateUser(updatedUser);
    onBack();
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <header style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e5e7eb', padding: '16px 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ color: '#111827', fontSize: '1.5rem', fontWeight: 'bold', margin: '0 0 4px 0' }}>{t('up_title')}</h1>
            <p style={{ color: '#374151', fontSize: '0.875rem', margin: 0 }}>{t('up_subtitle')}</p>
          </div>
          <button
            onClick={onBack}
            style={{ backgroundColor: '#6b7280', color: '#ffffff', padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
          >
            {t('up_back')}
          </button>
        </div>
      </header>

      <main style={{ maxWidth: '800px', margin: '0 auto', padding: '32px 16px' }}>
        <div style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', color: '#374151', fontWeight: '500', marginBottom: '8px' }}>
                  {t('up_name')}
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '16px' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', color: '#374151', fontWeight: '500', marginBottom: '8px' }}>
                  {t('up_email')}
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '16px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', color: '#374151', fontWeight: '500', marginBottom: '8px' }}>
                  {t('up_phone')}
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '16px' }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', color: '#374151', fontWeight: '500', marginBottom: '8px' }}>
                    {t('sf_dob')} 
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '16px' }}
                    max={new Date().toISOString().split('T')[0]}
                  />
                  {formData.calculatedAge && (
                    <p style={{ color: '#10b981', fontSize: '14px', marginTop: '4px' }}>
                      {t('sf_calc_age')}: {formData.calculatedAge} {t('sf_years')}
                    </p>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', color: '#374151', fontWeight: '500', marginBottom: '8px' }}>
                    {t('sf_gender')}
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '16px' }}
                  >
                    <option value="">{t('sf_select_gender')}</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', color: '#374151', fontWeight: '500', marginBottom: '8px' }}>
                    {t('sf_state')}
                  </label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '16px' }}
                  >
                    <option value="">{t('sf_select_state')}</option>
                    {states.map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', color: '#374151', fontWeight: '500', marginBottom: '8px' }}>
                    {t('sf_disabled')}
                  </label>
                  <select
                    name="isDifferentlyAbled"
                    value={formData.isDifferentlyAbled}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '16px' }}
                  >
                    <option value="">{t('sf_select_status')}</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', color: '#374151', fontWeight: '500', marginBottom: '8px' }}>
                    {t('up_new_pass')}
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '16px' }}
                    placeholder={t('up_leave_blank')}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', color: '#374151', fontWeight: '500', marginBottom: '8px' }}>
                    {t('up_confirm_pass')}
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '16px' }}
                    placeholder={t('up_confirm_pass')}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
              <button type="submit" style={{ backgroundColor: '#3b82f6', color: '#ffffff', padding: '12px 24px', borderRadius: '8px', border: 'none', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}>
                {t('up_update_btn')}
              </button>
              <button type="button" onClick={onBack} style={{ backgroundColor: '#6b7280', color: '#ffffff', padding: '12px 24px', borderRadius: '8px', border: 'none', fontSize: '16px', fontWeight: '600', cursor: 'pointer' }}>
                {t('up_cancel_btn')}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default UserProfile;