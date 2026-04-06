import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = ({ onLogout }) => {
  // Navigation State
  const [activeTab, setActiveTab] = useState('database'); 
  
  // Data States
  const [schemes, setSchemes] = useState([]);
  const [users, setUsers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  
  // Form States - 🎯 COORDINATED KEYS
  const emptyForm = { 
    name: '', category: '', state: 'All India', link: '', description: '', 
    minAge: 0, maxAge: 100, incomeLimit: '', requiredDocs: '', applicationSteps: '',
    targetGender: 'All', targetDifferentlyAbled: 'All' 
  };
  const [form, setForm] = useState(emptyForm);
  const [scrapeUrl, setScrapeUrl] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const navigate = useNavigate();

  // 🎯 ADDED THE STATES LIST
  const statesList = [
    'All India', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
  ];

  useEffect(() => {
    // 🛡️ THE SECURITY BOUNCER
    const sessionData = JSON.parse(localStorage.getItem('yogyatha-session') || '{}');
    const user = sessionData.user;
    
    if (!user || user.isAdmin !== true) {
        alert("🚨 SECURITY BREACH: Unauthorized access detected. Returning to Citizen Portal.");
        onLogout();
        navigate('/');
        return; // Stop the code right here!
    }

    fetchSchemes();
    fetchUsers();
  }, []);

  const getAuthHeader = () => {
    // Extract token from the new standardized session object
    const sessionData = JSON.parse(localStorage.getItem('yogyatha-session') || '{}');
    const token = sessionData.token;
    
    return token ? { 
        'x-auth-token': token,
        'Authorization': `Bearer ${token}` 
    } : {};
  };

  const fetchSchemes = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/schemes`);
      setSchemes(res.data.schemes);
    } catch (err) { console.error(err); }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/all-users`, { headers: getAuthHeader() });
      // 🎯 Safe Check: Ensures it's always an array before setting state
      const usersArray = Array.isArray(res.data) ? res.data : (res.data.users || []);
      setUsers(usersArray);
    } catch (err) { 
      console.error("Failed to fetch User Roster:", err); 
    }
  };

  const groupedSchemes = useMemo(() => {
    return schemes.reduce((acc, scheme) => {
        const cat = scheme.category || 'Uncategorized';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(scheme);
        return acc;
    }, {});
  }, [schemes]);

  // --- 🛰️ THE SCRAPER ACTION ---
  const handleFetchUrl = async (e) => {
        e.preventDefault();
        if (!scrapeUrl) return alert("Please enter a MyScheme URL");
        
        setIsScraping(true);
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { 'x-auth-token': token, 'Authorization': `Bearer ${token}` } };
           const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/schemes/scrape-url`, { url: scrapeUrl }, config);
            
            const safeFormat = (item) => {
                if (!item) return '';
                if (Array.isArray(item)) return item.join('\n');
                return String(item);
            };

            setForm({
                ...emptyForm,
                name: res.data.name || res.data.title || '',
                link: scrapeUrl,
                category: res.data.category || 'General',
                state: res.data.state || 'All India',
                description: res.data.description || '',
                requiredDocs: safeFormat(res.data.requiredDocs),
                applicationSteps: safeFormat(res.data.applicationSteps),
                // 🎯 THE RADAR CATCHERS: Updated to catch the new Python payload
                minAge: res.data.minAge || res.data.rules?.minAge || 0,
                maxAge: res.data.maxAge || res.data.rules?.maxAge || 100,
                incomeLimit: res.data.incomeLimit || res.data.rules?.incomeLimit || '',
                targetGender: res.data.targetGender || res.data.rules?.targetGender || 'All',
                targetDifferentlyAbled: res.data.targetDifferentlyAbled || res.data.rules?.targetDifferentlyAbled || 'All'
            });
            alert("✅ Data Extracted!");
        } catch (err) { 
            alert(`SCRAPER ERROR: ${err.response?.data?.msg || err.message}`); 
        } finally { setIsScraping(false); }
    };

  // --- 📝 THE EDIT ACTION ---
  const handleEditClick = (scheme) => {
    setForm({
        name: scheme.name || '', 
        link: scheme.link || '', 
        category: scheme.category || '', 
        state: scheme.state || 'All India', 
        description: scheme.description || '',
        minAge: scheme.rules?.minAge || 0, 
        maxAge: scheme.rules?.maxAge || 100, 
        incomeLimit: scheme.rules?.incomeLimit === 99999999 ? '' : (scheme.rules?.incomeLimit || ''),
        requiredDocs: scheme.requiredDocs ? scheme.requiredDocs.join('\n') : '', 
        applicationSteps: scheme.applicationSteps ? scheme.applicationSteps.join('\n') : '',
        targetGender: scheme.rules?.targetGender || 'All',
        targetDifferentlyAbled: scheme.rules?.targetDifferentlyAbled || 'All'
    });
    setEditingId(scheme._id); 
    setActiveTab('add');
  };

  // --- 💾 THE SAVE ACTION ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    const selectedGender = document.getElementById('targetGenderSelect')?.value || form.targetGender;
    const selectedDisability = document.getElementById('targetDisabilitySelect')?.value || form.targetDifferentlyAbled;

    const payload = {
        ...form, 
        requiredDocs: form.requiredDocs ? form.requiredDocs.split('\n').filter(doc => doc.trim() !== '') : [], 
        applicationSteps: form.applicationSteps ? form.applicationSteps.split('\n').filter(step => step.trim() !== '') : [],
        rules: { 
            minAge: parseInt(form.minAge) || 0, 
            maxAge: parseInt(form.maxAge) || 100, 
            incomeLimit: form.incomeLimit ? Number(form.incomeLimit) : 99999999,
            targetGender: selectedGender, 
            targetDifferentlyAbled: selectedDisability
        }
    };

    try {
      const config = { headers: getAuthHeader() };
      if (editingId) {
          await axios.put(`${import.meta.env.VITE_API_URL}/api/schemes/${editingId}`, payload, config);
      } else {
          await axios.post(`${import.meta.env.VITE_API_URL}/api/schemes`, payload, config);
          alert("✅ Intelligence Saved!");
      }
      fetchSchemes();
      setForm(emptyForm);
      setEditingId(null);
      setActiveTab('database'); 
    } catch (err) { 
        alert("Save failed. Check console."); 
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation(); 
    if(!window.confirm("Delete this scheme?")) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/schemes/${id}`, { headers: getAuthHeader() });
      
      // 🎯 THE FIX: Force the dashboard to refresh its data!
      fetchSchemes(); 
      
    } catch (err) { 
      console.error("Deletion Error:", err.response?.data || err.message);
      alert("Failed to delete. Check console for details."); 
    }
  };

  const handleMakeAdmin = async (e) => {
      e.preventDefault();
      if(!newAdminEmail) return;
      try {
          const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/make-admin`, { identifier: newAdminEmail }, { headers: getAuthHeader() });
          alert(`👑 ${res.data.msg}`);
          setNewAdminEmail('');
          fetchUsers();
      } catch (err) { alert(err.response?.data?.error || "Failed."); }
  };

  const inputStyle = "border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white w-full";
  const navBtnStyle = (tab) => `w-full flex items-center gap-3 px-6 py-3 font-semibold transition-all ${activeTab === tab ? 'bg-indigo-600 text-white border-r-4 border-indigo-300' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      <aside className="w-64 bg-gray-900 text-white flex flex-col shadow-2xl z-20">
        <div className="p-6 border-b border-gray-800">
            <h1 className="text-2xl font-black tracking-tight text-white">Yogyatha <span className="text-indigo-500">Admin</span></h1>
        </div>
        <nav className="flex-1 py-6 space-y-2">
            <button onClick={() => setActiveTab('database')} className={navBtnStyle('database')}>Categorized Database</button>
            <button onClick={() => { setEditingId(null); setForm(emptyForm); setActiveTab('add'); }} className={navBtnStyle('add')}>Fetch / Add Scheme</button>
            <button onClick={() => setActiveTab('users')} className={navBtnStyle('users')}>User Roster</button>
            <button onClick={() => setActiveTab('admins')} className={navBtnStyle('admins')}>Admin Access</button>
        </nav>
        <div className="p-6 border-t border-gray-800">
            <button onClick={() => { onLogout(); navigate('/'); }} className="w-full flex justify-center items-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-bold">Secure Logout</button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-y-auto">
        <header className="bg-white p-6 shadow-sm flex justify-between items-center sticky top-0 z-10">
            <h2 className="text-xl font-bold text-gray-800 uppercase tracking-wide">{activeTab}</h2>
            <div className="bg-indigo-50 text-indigo-700 px-4 py-1 rounded-full text-sm font-bold border border-indigo-100">Schemes: {schemes.length}</div>
        </header>

        <div className="p-8">
            {activeTab === 'database' && (
                <div className="space-y-10">
                    {Object.entries(groupedSchemes).sort().map(([category, catSchemes]) => (
                        <div key={category} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <h3 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-2">
                                <span className="w-3 h-8 bg-indigo-500 rounded-full inline-block"></span>
                                {category}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {catSchemes.map(s => (
                                <div key={s._id} onClick={() => handleEditClick(s)} className="bg-gray-50 rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-lg transition-all cursor-pointer">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-lg text-gray-900 line-clamp-1">{s.name}</h4>
                                        <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-1 rounded">{s.rules?.targetGender || 'All'}</span>
                                    </div>
                                    <div className="text-sm text-gray-500">Age: {s.rules?.minAge}-{s.rules?.maxAge} | {s.state || 'All India'}</div>
                                    <div className="mt-4 pt-3 border-t flex justify-between">
                                        <span className="text-xs text-indigo-600 font-bold uppercase">Edit Intelligence</span>
                                        <button onClick={(e) => handleDelete(s._id, e)} className="text-red-500 hover:text-red-700">Delete</button>
                                    </div>
                                </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'add' && (
                <div className="max-w-4xl mx-auto space-y-8">
                    <div className="bg-indigo-900 p-6 rounded-2xl shadow-xl">
                        <label className="block text-sm font-bold text-indigo-200 mb-3 uppercase tracking-widest">⚡ MyScheme Scraper Engine</label>
                        <div className="flex gap-3">
                            <input type="url" placeholder="https://www.myscheme.gov.in/schemes/..." className="flex-1 p-3 rounded-lg text-gray-900" value={scrapeUrl} onChange={e => setScrapeUrl(e.target.value)} />
                            <button onClick={handleFetchUrl} disabled={isScraping} className="bg-indigo-500 hover:bg-indigo-400 text-white px-8 py-3 rounded-lg font-bold">
                                {isScraping ? 'SCANNING...' : 'EXTRACT'}
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div><label className="text-xs font-black uppercase text-gray-400">Scheme Name</label>
                        <input className={inputStyle} value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
                        
                        <div><label className="text-xs font-black uppercase text-gray-400">Category</label>
                        <input className={inputStyle} value={form.category} onChange={e => setForm({...form, category: e.target.value})} required /></div>

                        {/* 🎯 THE RESTORED STATE DROPDOWN */}
                        <div>
                            <label className="text-xs font-black uppercase text-gray-400">State</label>
                            <select 
                                className={inputStyle} 
                                value={form.state} 
                                onChange={e => setForm({...form, state: e.target.value})}
                            >
                                {statesList.map(state => <option key={state} value={state}>{state}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="text-xs font-black uppercase text-gray-400">Target Gender</label>
                            <select 
                                id="targetGenderSelect" 
                                className={inputStyle} 
                                value={form.targetGender} 
                                onChange={e => setForm({...form, targetGender: e.target.value})}
                            >
                                <option value="All">All Genders</option>
                                <option value="Female">Female Only</option>
                                <option value="Male">Male Only</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-xs font-black uppercase text-gray-400">Differently Abled Only?</label>
                            <select 
                                id="targetDisabilitySelect" 
                                className={inputStyle} 
                                value={form.targetDifferentlyAbled} 
                                onChange={e => setForm({...form, targetDifferentlyAbled: e.target.value})}
                            >
                                <option value="All">No Restriction</option>
                                <option value="Yes">Yes (Disabled Only)</option>
                                <option value="No">No (General Only)</option>
                            </select>
                        </div>

                        <div><label className="text-xs font-black uppercase text-gray-400">Min Age</label>
                        <input type="number" className={inputStyle} value={form.minAge} onChange={e => setForm({...form, minAge: e.target.value})} /></div>

                        <div><label className="text-xs font-black uppercase text-gray-400">Max Age</label>
                        <input type="number" className={inputStyle} value={form.maxAge} onChange={e => setForm({...form, maxAge: e.target.value})} /></div>

                        <div className="md:col-span-2"><label className="text-xs font-black uppercase text-gray-400">Description</label>
                        <textarea className={`${inputStyle} h-32`} value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>

                        <button type="submit" className="md:col-span-2 bg-green-600 hover:bg-green-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg uppercase tracking-widest">
                            {editingId ? "Update Intelligence" : "Save Intelligence"}
                        </button>
                    </form>
                </div>
            )}

            {/* 🎯 NEW: LIVE USERS TAB */}
            {activeTab === 'users' && (
                <div className="animate-fade-in-up bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                    <div className="flex justify-between items-center mb-6 border-b pb-4">
                        <h2 className="text-2xl font-bold text-gray-800">Registered Citizens</h2>
                        <div className="bg-green-50 text-green-700 px-4 py-2 rounded-lg font-bold text-sm border border-green-200">
                            Total Citizens: {users.filter(u => !u.isAdmin).length}
                        </div>
                    </div>
                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                                    <th className="p-4 border-b font-black">Name</th>
                                    <th className="p-4 border-b font-black">Contact</th>
                                    <th className="p-4 border-b font-black">State</th>
                                    <th className="p-4 border-b font-black">Role</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u._id} className="border-b hover:bg-gray-50 transition-colors">
                                        <td className="p-4 font-bold text-gray-800">{u.name || 'Anonymous Citizen'}</td>
                                        <td className="p-4 text-gray-600 font-medium">{u.email || u.phone || 'N/A'}</td>
                                        <td className="p-4 text-gray-600 font-medium">{u.state || 'Not Set'}</td>
                                        <td className="p-4">
                                            <span className={u.isAdmin ? "bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-xs font-bold" : "bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold"}>
                                                {u.isAdmin ? 'Admin' : 'Citizen'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {users.length === 0 && <div className="p-8 text-center text-gray-500 font-bold">No users found in database.</div>}
                    </div>
                </div>
            )}

            {/* 🎯 NEW: ADMIN ACCESS TAB */}
            {activeTab === 'admins' && (
                <div className="animate-fade-in-up space-y-8">
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-4">Command Center Security</h2>
                        
                        <form onSubmit={handleMakeAdmin} className="flex flex-col md:flex-row gap-4 mb-10 bg-indigo-50 p-6 rounded-xl border border-indigo-100">
                            <input 
                                type="email" 
                                placeholder="Enter Citizen Email to grant Admin rights..." 
                                value={newAdminEmail}
                                onChange={(e) => setNewAdminEmail(e.target.value)}
                                className="flex-1 p-4 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white shadow-inner font-medium"
                                required
                            />
                            <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-lg font-bold shadow-md transition-colors whitespace-nowrap">
                                👑 Grant Admin Privileges
                            </button>
                        </form>

                        <h3 className="text-lg font-bold text-gray-600 uppercase tracking-widest mb-4">Active Commanders</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {users.filter(u => u.isAdmin).map(admin => (
                                <div key={admin._id} className="bg-white p-6 rounded-xl border-l-4 border-indigo-500 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                                    <div className="w-14 h-14 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-black text-2xl shadow-inner">
                                        {(admin.name || 'A')[0].toUpperCase()}
                                    </div>
                                    <div className="overflow-hidden">
                                        <h4 className="font-bold text-gray-900 text-lg truncate">{admin.name || 'Admin'}</h4>
                                        <p className="text-sm text-indigo-600 font-bold truncate">{admin.email || admin.phone}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;