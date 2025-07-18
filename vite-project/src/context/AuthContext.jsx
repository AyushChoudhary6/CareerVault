import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, apiUtils } from '../services/api';

// Create context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is already authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      const token = apiUtils.isAuthenticated();
      console.log('🔍 Auth check - Token exists:', !!token);
      
      if (token) {
        try {
          console.log('🔑 Attempting to get current user...');
          const userData = await authAPI.getCurrentUser();
          console.log('✅ User data retrieved:', userData);
          setUser(userData);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('❌ Auth check failed:', error);
          // Token might be expired, remove it
          authAPI.logout();
          setIsAuthenticated(false);
          setUser(null);
        }
      } else {
        console.log('ℹ️ No auth token found');
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Signup function
  const signup = async (userData) => {
    try {
      setError(null);
      setLoading(true);
      
      console.log('📝 Attempting signup with:', { username: userData.username, email: userData.email });
      const response = await authAPI.signup(userData);
      console.log('✅ Signup successful:', response.message);
      
      // After successful signup, automatically login
      console.log('🔑 Auto-login after signup...');
      await login({ email: userData.email, password: userData.password });
      
      return response;
    } catch (error) {
      console.error('❌ Signup error:', error);
      const errorMessage = apiUtils.handleError(error);
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Login function
  const login = async (credentials) => {
    try {
      setError(null);
      setLoading(true);
      
      console.log('🔑 Attempting login with:', credentials.email);
      const response = await authAPI.login(credentials);
      console.log('✅ Login response received:', { token_type: response.token_type });
      
      // Get user data after successful login
      console.log('👤 Fetching user data...');
      const userData = await authAPI.getCurrentUser();
      console.log('✅ User data received:', userData);
      
      setUser(userData);
      setIsAuthenticated(true);
      
      console.log('🎉 Login successful! User is now authenticated.');
      return response;
    } catch (error) {
      console.error('❌ Login error:', error);
      const errorMessage = apiUtils.handleError(error);
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    authAPI.logout();
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
    console.log('User logged out');
  };

  // Refresh token function
  const refreshToken = async () => {
    try {
      const response = await authAPI.refreshToken();
      console.log('Token refreshed successfully');
      return response;
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout(); // Force logout if refresh fails
      throw error;
    }
  };

  // Clear error function
  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    error,
    signup,
    login,
    logout,
    refreshToken,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
