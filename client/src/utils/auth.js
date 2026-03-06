// Authentication utilities for frontend

const API_BASE_URL = import.meta.env.VITE_API_URL;

// Store JWT token in localStorage
export const setAuthToken = (token) => {
  localStorage.setItem('yogyatha-token', token);
};

// Get JWT token from localStorage
export const getAuthToken = () => {
  return localStorage.getItem('yogyatha-token');
};

// Test API connectivity
export const testAPIConnectivity = async () => {
  try {
    console.log('🧪 Testing API connectivity from frontend...');
    const response = await fetch(`${API_BASE_URL}/health`);
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API connectivity test:', data);
      return true;
    } else {
      console.log('❌ API connectivity failed:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ API connectivity error:', error);
    return false;
  }
};

// Remove JWT token from localStorage
export const removeAuthToken = () => {
  localStorage.removeItem('yogyatha-token');
};

// Store user data in localStorage
export const setAuthUser = (user) => {
  localStorage.setItem('yogyatha-user', JSON.stringify(user));
};

// Get user data from localStorage
export const getAuthUser = () => {
  const user = localStorage.getItem('yogyatha-user');
  return user ? JSON.parse(user) : null;
};

// Remove user data from localStorage
export const removeAuthUser = () => {
  localStorage.removeItem('yogyatha-user');
};

// Clear all auth data
export const clearAuthData = () => {
  removeAuthToken();
  removeAuthUser();
};

// API request wrapper with authentication
export const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Request failed');
  }
  
  return response.json();
};

// Send OTP to mobile number
export const sendOTP = async (phone, isRegistration = false) => {
  try {
    const response = await apiRequest('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, isRegistration }),
    });
    return response;
  } catch (error) {
    throw error;
  }
};

// Verify OTP
export const verifyOTP = async (phone, otp) => {
  try {
    const response = await apiRequest('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, otp }),
    });
    
    if (response.success) {
      setAuthToken(response.token);
      setAuthUser(response.user);
    }
    
    return response;
  } catch (error) {
    throw error;
  }
};

// Resend OTP
export const resendOTP = async (phone) => {
  try {
    const response = await apiRequest('/auth/resend-otp', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    });
    return response;
  } catch (error) {
    throw error;
  }
};

// User registration with OTP
export const registerUserWithOTP = async (userData) => {
  try {
    const response = await apiRequest('/auth/register-with-otp', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (response.success) {
      setAuthToken(response.token);
      setAuthUser(response.user);
    }
    
    return response;
  } catch (error) {
    throw error;
  }
};

// User registration
export const registerUser = async (userData) => {
  try {
    const response = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (response.success) {
      setAuthToken(response.token);
      setAuthUser(response.user);
    }
    
    return response;
  } catch (error) {
    throw error;
  }
};

// User login
export const loginUser = async (email, password) => {
  try {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.success) {
      setAuthToken(response.token);
      setAuthUser(response.user);
    }
    
    return response;
  } catch (error) {
    throw error;
  }
  removeUserData();
  // Clear any other auth-related data
  localStorage.removeItem('yogyatha-session');
};

// Get user profile
export const getUserProfile = async () => {
  try {
    const response = await apiRequest('/auth/profile');
    const result = await response.json();
    
    if (result.success) {
      setUserData(result.user);
      return { success: true, user: result.user };
    } else {
      return { success: false, message: result.message };
    }
  } catch (error) {
    console.error('Get profile error:', error);
    return { success: false, message: 'Failed to get profile.' };
  }
};

// Update user profile
export const updateUserProfile = async (userData) => {
  try {
    const response = await apiRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(userData)
    });

    const result = await response.json();
    
    if (result.success) {
      setUserData(result.user);
      return { success: true, user: result.user };
    } else {
      return { success: false, message: result.message };
    }
  } catch (error) {
    console.error('Update profile error:', error);
    return { success: false, message: 'Failed to update profile.' };
  }
};

// Get all schemes
export const getAllSchemes = async () => {
  try {
    const response = await apiRequest('/schemes');
    return response.schemes || [];
  } catch (error) {
    console.error('Get schemes error:', error);
    return [];
  }
};
