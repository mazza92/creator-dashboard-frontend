import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../utils/api';
import secureStorage from '../utils/storage';
import { useNavigate } from "react-router-dom";
import { message } from "antd";

// Create the context with a default value
const SecurityContext = createContext({
  isAuthenticated: false,
  user: null,
  loading: true,
  error: null,
  login: () => {},
  register: () => {},
  logout: () => {},
  updateProfile: () => {},
  changePassword: () => {},
  clearError: () => {},
});

// Export the provider component
export function SecurityProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Check if user is authenticated
  const checkAuth = async () => {
    try {
      const tokens = secureStorage.getAuthTokens();
      if (!tokens) {
        setIsAuthenticated(false);
        setUser(null);
        return;
      }

      const response = await apiClient.getProfile();
      setUser(response.data);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
      setUser(null);
      secureStorage.clearAuth();
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (credentials) => {
    try {
      console.log("🔑 Attempting login...");
      const response = await apiClient.login(credentials);
      const { token, user_id, user_role } = response.data;

      if (!token) {
        throw new Error('No token received from server');
      }

      console.log("📦 Storing user data in secure storage...");
      
      // Store user data using secureStorage
      const user = { id: user_id, role: user_role };
      const userSuccess = secureStorage.setUserData(user);
      if (!userSuccess) {
        throw new Error('Failed to store user data securely');
      }

      // Update state
      setUser(user);
      setIsAuthenticated(true);
      
      console.log("✅ Login successful");
      message.success('Login successful!');
      
      return true;
    } catch (error) {
      console.error("🔥 Login error:", error);
      // Clear any partial data
      secureStorage.clearAuth();
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userId');
      message.error(error.response?.data?.message || 'Login failed. Please try again.');
      return false;
    }
  };

  // Register user
  const register = async (userData) => {
    try {
      setError(null);
      const response = await apiClient.register(userData);
      const { token, refreshToken, user } = response.data;

      secureStorage.setAuthTokens({ token, refreshToken });
      secureStorage.setUserData(user);

      setUser(user);
      setIsAuthenticated(true);
      return true;
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed');
      return false;
    }
  };

  // Logout user
  const logout = async () => {
    try {
      await apiClient.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      secureStorage.clearAuth();
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userId');
      setUser(null);
      setIsAuthenticated(false);
      navigate('/login');
    }
  };

  // Update user profile
  const updateProfile = async (data) => {
    try {
      setError(null);
      const response = await apiClient.updateProfile(data);
      const updatedUser = response.data;

      secureStorage.setUserData(updatedUser);
      setUser(updatedUser);
      return true;
    } catch (error) {
      setError(error.response?.data?.message || 'Profile update failed');
      return false;
    }
  };

  // Change password
  const changePassword = async (data) => {
    try {
      setError(null);
      await apiClient.changePassword(data);
      return true;
    } catch (error) {
      setError(error.response?.data?.message || 'Password change failed');
      return false;
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  const value = {
    isAuthenticated,
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    clearError,
  };

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
}

// Export the hook
export function useSecurity() {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
}

export default SecurityContext; 