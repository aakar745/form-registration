import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from '../config/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      checkAuth();
    } else {
      setLoading(false);
    }
  }, []);

  const checkAuth = async () => {
    try {
      console.log('[AuthContext] Checking auth with token:', localStorage.getItem('token'));
      const response = await axios.get('/api/auth/me');
      console.log('[AuthContext] Auth check response:', response.data);
      setUser(response.data);
      setError(null);
    } catch (error) {
      console.error('[AuthContext] Auth check error:', error);
      localStorage.removeItem('token');
      setUser(null);
      setError('Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      console.log('[AuthContext] Login attempt for:', email);
      const response = await axios.post('/api/auth/login', { email, password });
      console.log('[AuthContext] Login response:', response.data);
      
      if (response.data.requireMFA) {
        return {
          requireMFA: true,
          tempToken: response.data.tempToken
        };
      }

      localStorage.setItem('token', response.data.token);
      if (response.data.user) {
        console.log('[AuthContext] Setting user data:', response.data.user);
        setUser(response.data.user);
      }
      await checkAuth(); // Fetch user data after login
      return { success: true };
    } catch (error) {
      console.error('[AuthContext] Login error:', error);
      setError(error.response?.data?.error || 'Login failed');
      throw error;
    }
  };

  const register = async (username, email, password) => {
    try {
      const response = await axios.post('/api/auth/register', {
        username,
        email,
        password
      });

      if (response.data.success) {
        // Store the token
        localStorage.setItem('token', response.data.token);
        
        // Store MFA secret temporarily (will be needed for QR code setup)
        sessionStorage.setItem('mfaSecret', response.data.mfaSecret);
        
        // Update user state
        await checkAuth();
        
        return {
          success: true,
          mfaSecret: response.data.mfaSecret
        };
      } else {
        throw new Error(response.data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('mfaToken');
    setUser(null);
    setError(null);
  };

  const updateUser = (userData) => {
    setUser(userData);
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    register,
    checkAuth,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
