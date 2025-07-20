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
      const isAuth = apiUtils.isAuthenticated();
      console.log('🔍 Auth check - User authenticated:', isAuth);
      
      if (isAuth) {
        try {
          console.log('🔑 Attempting to get current user from Cognito...');
          const userData = await authAPI.getCurrentUser();
          console.log('✅ User data retrieved from Cognito:', userData);
          setUser(userData);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('❌ Auth check failed:', error);
          // Token might be expired or invalid, clear stored tokens
          await authAPI.logout();
          setIsAuthenticated(false);
          setUser(null);
        }
      } else {
        console.log('ℹ️ No valid auth tokens found');
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
      
      console.log('📝 Attempting Cognito signup with:', { 
        username: userData.username, 
        email: userData.email 
      });
      
      const response = await authAPI.signup(userData);
      console.log('✅ Cognito signup successful:', response.message);
      
      // After successful signup, automatically login
      console.log('🔑 Auto-login after signup...');
      await login({ 
        email: userData.email, 
        password: userData.password 
      });
      
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
      
      console.log('🔑 Attempting Cognito login with:', credentials.email || credentials.username);
      const response = await authAPI.login(credentials);
      console.log('✅ Cognito login response received:', { 
        token_type: response.token_type,
        expires_in: response.expires_in 
      });
      
      // Get user data from Cognito after successful login
      console.log('👤 Fetching user data from Cognito...');
      const userData = await authAPI.getCurrentUser();
      console.log('✅ User data received from Cognito:', userData);
      
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
  const logout = async () => {
    try {
      setLoading(true);
      console.log('🚪 Logging out user...');
      
      // Call backend logout endpoint (clears any server-side session tracking)
      await authAPI.logout();
      
      // Clear local state
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
      
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Even if logout fails, clear local state
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  // Refresh token function
  const refreshToken = async () => {
    try {
      console.log('🔄 Refreshing Cognito tokens...');
      const response = await authAPI.refreshToken();
      console.log('✅ Tokens refreshed successfully');
      return response;
    } catch (error) {
      console.error('❌ Token refresh failed:', error);
      // If refresh fails, logout the user
      await logout();
      throw error;
    }
  };

  // Update user information
  const updateUser = (updatedUserData) => {
    setUser(prevUser => ({
      ...prevUser,
      ...updatedUserData
    }));
  };

  // Clear any errors
  const clearError = () => {
    setError(null);
  };

  // Get password requirements
  const getPasswordRequirements = async () => {
    try {
      return await authAPI.getPasswordRequirements();
    } catch (error) {
      console.error('❌ Failed to get password requirements:', error);
      // Return default requirements if API fails
      return {
        min_length: 8,
        require_uppercase: true,
        require_lowercase: true,
        require_numbers: true,
        require_symbols: true,
        description: "Password must be at least 8 characters long and contain uppercase, lowercase, numbers, and symbols"
      };
    }
  };

  // Check if current session is valid
  const validateSession = async () => {
    try {
      const userData = await authAPI.getCurrentUser();
      setUser(userData);
      return true;
    } catch (error) {
      console.error('❌ Session validation failed:', error);
      await logout();
      return false;
    }
  };

  const value = {
    // State
    user,
    isAuthenticated,
    loading,
    error,
    
    // Actions
    signup,
    login,
    logout,
    refreshToken,
    updateUser,
    clearError,
    getPasswordRequirements,
    validateSession,
    
    // Utility functions
    isTokenExpired: () => !apiUtils.isAuthenticated(),
    getUserInfo: () => apiUtils.getStoredUserInfo(),
    forceTokenRefresh: apiUtils.forceTokenRefresh
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
