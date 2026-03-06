import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next'; // 🎯 Translation Engine
import UserProfile from './UserProfile';
import SchemeFinder from './SchemeFinder';
import Results from './Results';

const UserDashboard = ({ user, onLogout, onUpdateUser }) => {
  const { t, i18n } = useTranslation(); 
  
  const [activeTab, setActiveTab] = useState('overview'); 
  const [savedSchemes, setSavedSchemes] = useState([]);
  const [filteredSchemes, setFilteredSchemes] = useState([]);
  const [allSchemesList, setAllSchemesList] = useState([]);
  const [isLoadingSchemes, setIsLoadingSchemes] = useState(true);

  useEffect(() => {
    if (user) {
      loadSavedSchemes();
      fetchSchemes();
    } else {
      setIsLoadingSchemes(false);
    }
  }, [user]);

  const fetchSchemes = async () => {
    setIsLoadingSchemes(true);
    try {
      const sessionData = localStorage.getItem('user'); 
      const currentUser = sessionData ? JSON.parse(sessionData) : (user || {}); 

      const query = `?gender=${currentUser.gender || 'All'}&age=${currentUser.age || ''}&isDifferentlyAbled=${currentUser.isDifferentlyAbled || 'All'}&state=${currentUser.state || 'All'}`;
      
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/schemes${query}`);
      
      if (res.data && res.data.schemes) {
          setAllSchemesList(res.data.schemes);
          setFilteredSchemes(res.data.schemes);
      }
    } catch (err) {
      console.error("Dashboard Error:", err);
      setAllSchemesList([]);
      setFilteredSchemes([]);
    } finally {
      setIsLoadingSchemes(false); 
    }
  };

  const getUserIdentifier = () => {
      return user?._id || user?.phone || user?.email || 'guest';
  };

  const loadSavedSchemes = () => {
    try {
      const identifier = getUserIdentifier();
      const saved = JSON.parse(localStorage.getItem(`saved-schemes-${identifier}`) || '[]');
      setSavedSchemes(Array.isArray(saved) ? saved : []);
    } catch (error) {
      setSavedSchemes([]);
    }
  };

  const saveScheme = (scheme) => {
    try {
      const identifier = getUserIdentifier();
      const saved = JSON.parse(localStorage.getItem(`saved-schemes-${identifier}`) || '[]');
      const safeSaved = Array.isArray(saved) ? saved : [];
      
      const exists = safeSaved.find(s => (s._id || s.id) === (scheme._id || scheme.id));
      
      if (!exists) {
        safeSaved.push({ ...scheme, savedOn: new Date().toISOString().split('T')[0] });
        localStorage.setItem(`saved-schemes-${identifier}`, JSON.stringify(safeSaved));
        setSavedSchemes(safeSaved);
        alert('✅ Scheme saved to your dashboard!');
      } else {
        alert('⚠️ This scheme is already in your saved list!');
      }
    } catch (error) {
      alert('Error saving scheme');
    }
  };

  const removeSavedScheme = (schemeId) => {
    try {
      const identifier = getUserIdentifier();
      const saved = JSON.parse(localStorage.getItem(`saved-schemes-${identifier}`) || '[]');
      const safeSaved = Array.isArray(saved) ? saved : [];
      
      const updated = safeSaved.filter(s => (s._id || s.id) !== schemeId);
      localStorage.setItem(`saved-schemes-${identifier}`, JSON.stringify(updated));
      setSavedSchemes(updated);
      alert('🗑️ Scheme removed from saved list.');
    } catch (error) {
      alert('Error removing scheme');
    }
  };

  const navBtnStyle = (tab) => `w-full flex items-center gap-3 px-6 py-4 font-semibold transition-all text-left ${activeTab === tab ? 'bg-blue-600 text-white border-r-4 border-blue-300' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      <aside className="w-64 bg-gray-900 text-white flex flex-col shadow-2xl z-20">
        <div className="p-6 border-b border-gray-800">
            <h1 className="text-3xl font-black tracking-tight text-white mb-1">{t('app_title', 'Yogyatha')}</h1>
            <p className="text-xs text-blue-400 font-medium tracking-wide">{t('motto')}</p>
        </div>

        <nav className="flex-1 py-6 space-y-1 overflow-y-auto">
            <button onClick={() => setActiveTab('overview')} className={navBtnStyle('overview')}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                {t('nav_home')}
            </button>
            <button onClick={() => setActiveTab('schemes')} className={navBtnStyle('schemes')}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                {t('nav_matches')}
            </button>
            <button onClick={() => setActiveTab('saved')} className={navBtnStyle('saved')}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21z"></path></svg>
                {t('nav_saved')}
            </button>
            <button onClick={() => setActiveTab('all')} className={navBtnStyle('all')}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6m0 0l-14 0v-6a2 2 0 00-2-2H5m14 0a2 2 0 012 2v6a2 2 0 002 2z"></path></svg>
                {t('nav_directory')}
            </button>
            <button onClick={() => setActiveTab('profile')} className={navBtnStyle('profile')}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                {t('nav_profile')}
            </button>
        </nav>

        <div className="p-6 border-t border-gray-800">
            <button onClick={onLogout} className="w-full flex justify-center items-center gap-2 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-bold transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                {t('nav_logout')}
            </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        <header className="bg-white p-6 shadow-sm flex justify-between items-center z-10 sticky top-0">
            <div>
                <h2 className="text-xl font-bold text-gray-800">
                    {activeTab === 'overview' && `${t('welcome_back')}, ${user?.name || 'Citizen'}`}
                    {activeTab === 'profile' && "Manage Your Intelligence Profile"}
                    {activeTab === 'schemes' && "Intelligence Matcher Engine"}
                    {activeTab === 'saved' && "Your Secured Schemes"}
                    {activeTab === 'all' && "National Entitlement Directory"}
                </h2>
            </div>
            
            <div className="flex items-center gap-4">
                <select 
                    onChange={(e) => i18n.changeLanguage(e.target.value)}
                    value={i18n.language}
                    className="bg-gray-50 border border-gray-200 text-gray-700 text-sm font-bold rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 cursor-pointer shadow-sm"
                >
                    <option value="en">English</option>
                    <option value="te">తెలుగు</option>
                    <option value="hi">हिंदी</option>
                </select>

                <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-bold border border-blue-100 flex items-center gap-2 shadow-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    {t('profile_active')}
                </div>
            </div>
        </header>

        <div className="p-8">
            {activeTab === 'overview' && (
                <div className="animate-fade-in-up max-w-5xl mx-auto">
                    <div className="mb-10 text-center bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl p-10 text-white shadow-lg">
                        <h2 className="text-4xl font-black mb-3 tracking-tight">{t('app_title')}</h2>
                        <p className="text-blue-200 text-lg font-medium max-w-2xl mx-auto">
                            {t('hub_desc')}
                        </p>
                    </div>

                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 mb-10">
                        <h3 className="text-lg font-bold text-gray-800 mb-6 border-b pb-2">{t('dash_status')}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="flex items-center p-6 bg-blue-50 rounded-xl border border-blue-100 shadow-sm">
                                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-black shadow-md mr-6">
                                    {savedSchemes.length}
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold text-gray-900 mb-1">{t('nav_saved')}</h4>
                                    <p className="text-gray-600 text-sm">{t('saved_desc')}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center p-6 bg-green-50 rounded-xl border border-green-100 shadow-sm">
                                <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center text-2xl font-black shadow-md mr-6">
                                    {user?.dateOfBirth && user?.state ? '100%' : '50%'}
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold text-gray-900 mb-1">{t('profile_health')}</h4>
                                    <p className="text-gray-600 text-sm">{t('health_desc')}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <h3 className="text-lg font-bold text-gray-800 mb-4 px-2">{t('quick_nav')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div onClick={() => setActiveTab('schemes')} className="bg-white p-6 rounded-xl border-l-4 border-blue-500 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer">
                            <h4 className="font-bold text-gray-900 mb-2">{t('nav_matches')} 🔍</h4>
                            <p className="text-gray-600 text-sm">{t('scan_db')}</p>
                        </div>
                        <div onClick={() => setActiveTab('all')} className="bg-white p-6 rounded-xl border-l-4 border-indigo-500 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer">
                            <h4 className="font-bold text-gray-900 mb-2">{t('nav_directory')} 📚</h4>
                            <p className="text-gray-600 text-sm">{t('explore_all')}</p>
                        </div>
                        <div onClick={() => setActiveTab('profile')} className="bg-white p-6 rounded-xl border-l-4 border-green-500 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer">
                            <h4 className="font-bold text-gray-900 mb-2">{t('nav_profile')} ✏️</h4>
                            <p className="text-gray-600 text-sm">{t('modify_profile')}</p>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'profile' && (
                <div className="animate-fade-in-up">
                    <UserProfile user={user} onUpdateUser={onUpdateUser} onBack={() => setActiveTab('overview')} />
                </div>
            )}

            {activeTab === 'schemes' && (
                <div className="animate-fade-in-up -mt-8">
                    <SchemeFinder 
                        user={user} 
                        onBack={() => setActiveTab('overview')} 
                        schemes={Array.isArray(filteredSchemes) ? filteredSchemes : []} 
                        onSaveScheme={saveScheme}
                        onRemoveSavedScheme={removeSavedScheme}
                    />
                </div>
            )}

            {activeTab === 'saved' && (
                <div className="animate-fade-in-up">
                    {savedSchemes.length === 0 ? (
                        <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-200 text-center max-w-2xl mx-auto mt-10">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21z"></path></svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">No Saved Schemes Yet</h3>
                            <p className="text-gray-600 mb-8">You haven't bookmarked any schemes. Use the Intelligence Matcher to find entitlements tailored to your exact profile.</p>
                            <button onClick={() => setActiveTab('schemes')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-md transition-transform hover:-translate-y-1">
                                Find Schemes Now
                            </button>
                        </div>
                    ) : (
                        <Results 
                            schemes={savedSchemes}
                            isLoading={false}
                            onSaveScheme={saveScheme}
                            onRemoveSavedScheme={removeSavedScheme}
                            isSavedView={true}
                        />
                    )}
                </div>
            )}

            {activeTab === 'all' && (
                <div className="animate-fade-in-up">
                    <Results 
                        schemes={Array.isArray(allSchemesList) ? allSchemesList : []} 
                        isLoading={isLoadingSchemes}
                        onSaveScheme={saveScheme}
                        onRemoveSavedScheme={removeSavedScheme}
                        isSavedView={false}
                    />
                </div>
            )}
            
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;