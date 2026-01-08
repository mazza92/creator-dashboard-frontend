import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../config/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedRole = localStorage.getItem('userRole');
    const storedId = localStorage.getItem('userId');
    
    if (storedToken) {
      console.log('📦 Initializing auth state from localStorage');
      setToken(storedToken);
      setUserRole(storedRole);
      setUserId(storedId);
    }
  }, []);

  const login = async (credentials) => {
    if (isLoading) {
      console.log('⏳ Login already in progress, skipping duplicate request');
      return false;
    }

    setIsLoading(true);
    try {
      console.log('🔑 Starting login process for:', credentials.email);
      const response = await apiClient.post('/login', credentials);
      console.log('✅ Login response:', {
        status: response.status,
        data: response.data,
        headers: response.headers
      });

      if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
        localStorage.setItem('userRole', response.data.user_role);
        localStorage.setItem('userId', response.data.user_id);

        const storedToken = localStorage.getItem('token');
        if (!storedToken) {
          console.error('❌ Failed to store token in localStorage');
          throw new Error('Failed to store authentication token');
        }

        setToken(response.data.access_token);
        setUserRole(response.data.user_role);
        setUserId(response.data.user_id);

        console.log('✅ Login successful, token and state updated');
        return true;
      } else {
        console.error('❌ No access_token in response:', response.data);
        throw new Error('No access token provided');
      }
    } catch (error) {
      console.error('❌ Login error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config,
        code: error.code
      });
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userId');
      setToken(null);
      setUserRole(null);
      setUserId(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUserRole(null);
    setUserId(null);
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
  };

  const value = {
    token,
    userRole,
    userId,
    login,
    logout,
    isLoading,
    isAuthenticated: !!token
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