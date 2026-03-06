import React, { useState } from 'react';
import axios from 'axios';
import { auth } from '../firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

const Login = ({ onLogin }) => {
    // UI State
    const [activeTab, setActiveTab] = useState('user'); // 'user' or 'admin'
    const [loading, setLoading] = useState(false);

    // User OTP State
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState(1); // 1: Enter Phone, 2: Enter OTP
    const [confirmationResult, setConfirmationResult] = useState(null);

    // Admin State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // ==========================================
    // 🛡️ CITIZEN OTP LOGIN LOGIC (FIREBASE)
    // ==========================================
    const setupRecaptcha = () => {
        if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                size: 'invisible',
            });
        }
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();
        if (phone.length !== 10) return alert("Please enter a valid 10-digit mobile number.");
        
        setLoading(true);
        try {
            setupRecaptcha();
            const appVerifier = window.recaptchaVerifier;
            const formattedPhone = `+91${phone}`; 
            
            const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
            setConfirmationResult(confirmation);
            setStep(2); 
        } catch (error) {
            console.error("SMS Error:", error);
            alert("Failed to send OTP. Please check your internet connection or try again later.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        if (!otp) return alert("Please enter the OTP.");
        
        setLoading(true);
        try {
            const result = await confirmationResult.confirm(otp);
            const user = result.user;
            
            // Sync with your Node.js Backend
           const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/phone-login`, {
                phone: user.phoneNumber,
                uid: user.uid
            });

            localStorage.setItem('yogyatha-session', JSON.stringify({
                token: res.data.token,
                user: res.data.user
            }));

            alert("✅ Secure Login Successful!");
            onLogin(res.data.user); // Tells App.jsx to load the User Dashboard

        } catch (error) {
            console.error("Verification Error:", error);
            alert("Invalid OTP. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // ==========================================
    // 👑 ADMIN PASSWORD LOGIN LOGIC
    // ==========================================
    const handleAdminLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Adjust this URL if your admin login route is different!
           const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, { email, password });
            
            if (!res.data.user.isAdmin) {
                alert("Unauthorized. This portal is for Administrators only.");
                setLoading(false);
                return;
            }

            localStorage.setItem('yogyatha-session', JSON.stringify({
                token: res.data.token,
                user: res.data.user
            }));

            onLogin(res.data.user); // Tells App.jsx to load the Admin Dashboard
        } catch (err) {
            alert(err.response?.data?.msg || "Login failed. Check your credentials.");
        } finally {
            setLoading(false);
        }
    };

    // --- STYLES ---
    const tabStyle = (tab) => `flex-1 py-3 text-center font-bold cursor-pointer border-b-2 transition-colors ${activeTab === tab ? 'border-blue-600 text-blue-600' : 'border-gray-200 text-gray-500 hover:text-gray-700'}`;
    const inputStyle = "w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 font-medium text-gray-800";

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
                
                {/* TABS */}
                <div className="flex bg-white">
                    <div onClick={() => { setActiveTab('user'); setStep(1); }} className={tabStyle('user')}>
                        👤 User Portal
                    </div>
                    <div onClick={() => setActiveTab('admin')} className={tabStyle('admin')}>
                        🛡️ Admin Portal
                    </div>
                </div>

                <div className="p-8">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-blue-900 mb-1">
                            {activeTab === 'user' ? 'Citizen Access' : 'Command Center'}
                        </h2>
                        <p className="text-gray-500 text-sm">
                            {activeTab === 'user' ? 'Login with your mobile number.' : 'Enter your administrator credentials.'}
                        </p>
                    </div>

                    {/* INVISIBLE RECAPTCHA FOR FIREBASE */}
                    <div id="recaptcha-container"></div>

                    {/* --- USER TAB CONTENT --- */}
                    {activeTab === 'user' && step === 1 && (
                        <form onSubmit={handleSendOtp} className="space-y-5 animate-fade-in-up">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Mobile Number</label>
                                <div className="flex">
                                    <span className="bg-gray-100 border border-gray-300 border-r-0 rounded-l-lg px-4 flex items-center text-gray-600 font-bold">
                                        +91
                                    </span>
                                    <input 
                                        type="tel" maxLength="10" placeholder="9876543210"
                                        className="w-full border border-gray-300 p-3 rounded-r-lg focus:ring-2 focus:ring-blue-500 font-bold tracking-widest text-lg" 
                                        value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                                        required
                                    />
                                </div>
                            </div>
                            <button disabled={loading} type="submit" className={`w-full py-4 rounded-xl font-bold text-white shadow-md transition-all ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700 hover:-translate-y-1'}`}>
                                {loading ? 'Securing Connection...' : 'Get Secure OTP'}
                            </button>
                        </form>
                    )}

                    {activeTab === 'user' && step === 2 && (
                        <form onSubmit={handleVerifyOtp} className="space-y-5 animate-fade-in-up">
                            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-center mb-2">
                                <p className="text-sm text-blue-800">OTP sent to <strong>+91 {phone}</strong></p>
                                <button type="button" onClick={() => setStep(1)} className="text-blue-600 font-bold text-xs mt-1 hover:underline">Change Number</button>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Enter 6-Digit OTP</label>
                                <input 
                                    type="text" maxLength="6" placeholder="------"
                                    className="w-full border border-gray-300 p-4 rounded-lg focus:ring-2 focus:ring-blue-500 font-bold text-center text-2xl tracking-[0.5em]" 
                                    value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                    required
                                />
                            </div>
                            <button disabled={loading} type="submit" className={`w-full py-4 rounded-xl font-bold text-white shadow-md transition-all ${loading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700 hover:-translate-y-1'}`}>
                                {loading ? 'Verifying...' : 'Verify & Login'}
                            </button>
                        </form>
                    )}

                    {/* --- ADMIN TAB CONTENT --- */}
                    {activeTab === 'admin' && (
                        <form onSubmit={handleAdminLogin} className="space-y-5 animate-fade-in-up">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Admin Email</label>
                                <input 
                                    type="email" placeholder="admin@yogyatha.com" className={inputStyle}
                                    value={email} onChange={(e) => setEmail(e.target.value)} required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Master Password</label>
                                <input 
                                    type="password" placeholder="••••••••" className={inputStyle}
                                    value={password} onChange={(e) => setPassword(e.target.value)} required
                                />
                            </div>
                            <button disabled={loading} type="submit" className={`w-full py-4 rounded-xl font-bold text-white shadow-md transition-all ${loading ? 'bg-gray-400' : 'bg-gray-900 hover:bg-black hover:-translate-y-1'}`}>
                                {loading ? 'Authenticating...' : 'Access Command Center'}
                            </button>
                        </form>
                    )}

                </div>
            </div>
            {activeTab === 'user' && step === 1 && (
                <p className="text-gray-500 text-sm mt-6">New to Yogyatha? Just enter your number, we'll register you automatically.</p>
            )}
        </div>
    );
};

export default Login;