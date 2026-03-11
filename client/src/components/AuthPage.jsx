import React, { useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const AuthPage = ({ onLogin }) => {
    const { t, i18n } = useTranslation();
    
    // Modes: 'login', 'register', 'forgot', 'reset'
    const [mode, setMode] = useState('login'); 
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        state: 'All India',
        otp: '',
        newPassword: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const statesList = [
        'All India', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
        'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
        'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
        'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
        'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
    ];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError(''); // Clear errors when typing
    };

    // --- 1. LOGIN OPERATION ---
    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
                email: formData.email,
                password: formData.password
            });
            localStorage.setItem('token', res.data.token);
            onLogin(res.data.user);
        } catch (err) {
            setError(err.response?.data?.msg || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    // --- 2. REGISTER OPERATION ---
    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
                name: formData.name,
                email: formData.email,
                password: formData.password,
                phone: formData.phone,
                state: formData.state
            });
            // Auto-login after successful registration
            localStorage.setItem('yogyatha-session', JSON.stringify({
    token: res.data.token,
    user: res.data.user
}));
            onLogin(res.data.user);
        } catch (err) {
            setError(err.response?.data?.msg || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    // --- 3. REQUEST OTP OPERATION ---
    const handleRequestOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccessMsg('');
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/forgot-password`, {
                email: formData.email
            });
            setSuccessMsg(res.data.msg);
            setMode('reset'); // Move to Step 4
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    // --- 4. RESET PASSWORD OPERATION ---
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/reset-password`, {
                email: formData.email,
                otp: formData.otp,
                newPassword: formData.newPassword
            });
            setSuccessMsg(res.data.msg);
            setMode('login'); // Send back to login!
            // Clear sensitive fields
            setFormData({ ...formData, password: '', otp: '', newPassword: '' });
        } catch (err) {
            setError(err.response?.data?.msg || 'Invalid or expired OTP');
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = "w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-800 transition-all outline-none";
    const btnStyle = "w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg transition-transform hover:-translate-y-1 mt-4 disabled:bg-gray-400";

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-gray-900 flex items-center justify-center p-4 font-sans">
            
            {/* Top Right Language Switcher */}
            <div className="absolute top-6 right-6">
                <select 
                    onChange={(e) => i18n.changeLanguage(e.target.value)}
                    value={i18n.language}
                    className="bg-white/10 border border-white/20 text-white text-sm font-bold rounded-lg block p-2 cursor-pointer outline-none backdrop-blur-md"
                >
                    <option value="en" className="text-black">English</option>
                    <option value="te" className="text-black">తెలుగు</option>
                    <option value="hi" className="text-black">हिंदी</option>
                </select>
            </div>

            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up">
                
                {/* Header Section */}
                <div className="bg-blue-50 p-8 text-center border-b border-blue-100">
                    <h1 className="text-4xl font-black text-blue-900 mb-2">{t('app_title', 'Yogyatha')}</h1>
                    <p className="text-blue-600 font-medium">{t('app_subtitle', 'Access your entitlements.')}</p>
                </div>

                <div className="p-8">
                    {/* Status Messages */}
                    {error && <div className="mb-4 p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm font-bold text-center">{error}</div>}
                    {successMsg && <div className="mb-4 p-4 bg-green-50 text-green-700 border border-green-200 rounded-xl text-sm font-bold text-center">{successMsg}</div>}

                    {/* --- LOGIN UI --- */}
                    {mode === 'login' && (
                        <form onSubmit={handleLogin} className="space-y-4">
                            <input type="email" name="email" placeholder={t('email_placeholder', 'Email Address')} value={formData.email} onChange={handleChange} className={inputStyle} required />
                            <input type="password" name="password" placeholder={t('password_placeholder', 'Password')} value={formData.password} onChange={handleChange} className={inputStyle} required />
                            
                            <div className="flex justify-end">
                                <button type="button" onClick={() => { setMode('forgot'); setError(''); setSuccessMsg(''); }} className="text-sm font-bold text-blue-600 hover:text-blue-800">
                                    Forgot Password?
                                </button>
                            </div>

                            <button type="submit" disabled={loading} className={btnStyle}>
                                {loading ? 'Authenticating...' : t('secure_login', 'Secure Login')}
                            </button>
                            
                            <p className="text-center text-gray-500 mt-6 text-sm">
                                Don't have an account? <button type="button" onClick={() => { setMode('register'); setError(''); }} className="font-bold text-blue-600 hover:underline">Register Here</button>
                            </p>
                        </form>
                    )}

                    {/* --- REGISTER UI --- */}
                    {mode === 'register' && (
                        <form onSubmit={handleRegister} className="space-y-4">
                            <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} className={inputStyle} required />
                            <input type="email" name="email" placeholder={t('email_placeholder', 'Email Address')} value={formData.email} onChange={handleChange} className={inputStyle} required />
                            <input type="tel" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} className={inputStyle} required />
                            <select name="state" value={formData.state} onChange={handleChange} className={inputStyle}>
                                {statesList.map(state => <option key={state} value={state}>{state}</option>)}
                            </select>
                            <input type="password" name="password" placeholder="Create Password" value={formData.password} onChange={handleChange} className={inputStyle} required minLength="6" />
                            
                            <button type="submit" disabled={loading} className={btnStyle}>
                                {loading ? 'Registering...' : 'Create Account'}
                            </button>
                            
                            <p className="text-center text-gray-500 mt-6 text-sm">
                                Already registered? <button type="button" onClick={() => { setMode('login'); setError(''); }} className="font-bold text-blue-600 hover:underline">Login Here</button>
                            </p>
                        </form>
                    )}

                    {/* --- FORGOT PASSWORD UI --- */}
                    {mode === 'forgot' && (
                        <form onSubmit={handleRequestOtp} className="space-y-4">
                            <h3 className="text-lg font-bold text-gray-800 mb-2 text-center">Password Recovery</h3>
                            <p className="text-sm text-gray-500 text-center mb-6">Enter your registered email address, and we will send you a 6-digit OTP to reset your password.</p>
                            
                            <input type="email" name="email" placeholder="Registered Email Address" value={formData.email} onChange={handleChange} className={inputStyle} required />
                            
                            <button type="submit" disabled={loading} className={btnStyle}>
                                {loading ? 'Sending...' : 'Send OTP'}
                            </button>
                            
                            <p className="text-center mt-6">
                                <button type="button" onClick={() => { setMode('login'); setError(''); }} className="font-bold text-gray-500 hover:text-gray-800 text-sm">← Back to Login</button>
                            </p>
                        </form>
                    )}

                    {/* --- RESET PASSWORD UI --- */}
                    {mode === 'reset' && (
                        <form onSubmit={handleResetPassword} className="space-y-4">
                            <h3 className="text-lg font-bold text-gray-800 mb-2 text-center">Enter OTP</h3>
                            <p className="text-sm text-green-600 font-bold text-center mb-6">OTP sent to {formData.email}</p>
                            
                            <input type="text" name="otp" placeholder="Enter 6-Digit OTP" value={formData.otp} onChange={handleChange} className={`${inputStyle} text-center tracking-widest text-2xl font-bold`} maxLength="6" required />
                            <input type="password" name="newPassword" placeholder="Enter New Password" value={formData.newPassword} onChange={handleChange} className={inputStyle} required minLength="6"/>
                            
                            <button type="submit" disabled={loading} className={btnStyle}>
                                {loading ? 'Verifying...' : 'Reset Password'}
                            </button>
                        </form>
                    )}

                </div>
            </div>
        </div>
    );
};

export default AuthPage;