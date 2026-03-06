import React, { useState, useEffect } from 'react';
import AuthPage from './components/AuthPage';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import axios from 'axios';

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (token && savedUser) {
        try {
            const parsedUser = JSON.parse(savedUser);
            setUser(parsedUser);
        } catch (e) {
            console.error("Corrupted local storage data. Clearing...");
            localStorage.clear();
        }
      }
      setIsLoading(false);
    };
    checkUser();
  }, []);

  const handleLogin = (userData) => {
    console.log("🚨 INCOMING USER DATA FROM BACKEND:", userData); // Radar check!
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData)); 
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const handleUpdateUser = (updatedUserData) => {
    setUser(updatedUserData);
    localStorage.setItem('user', JSON.stringify(updatedUserData));
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white font-bold">Initializing Yogyatha Systems...</div>;
  }

  // 1. If not logged in, show the Auth Page
  if (!user) {
    return <AuthPage onLogin={handleLogin} />;
  }

  // 2. 🎯 THE ROUTING FIX: Forgiving truthy check
  if (user.isAdmin) {
    console.log("👑 Routing to Admin Command Center...");
    return <AdminDashboard onLogout={handleLogout} user={user} />;
  }

  // 3. Otherwise, show the normal Citizen Dashboard
  console.log("👤 Routing to Citizen Dashboard...");
  return <UserDashboard user={user} onLogout={handleLogout} onUpdateUser={handleUpdateUser} />;
}

export default App;