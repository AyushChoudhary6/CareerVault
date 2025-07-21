import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const API_BASE_URL = 'http://localhost:8000';

// Auth API calls
const authAPI = {
  signup: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  login: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Store token
    if (data.access_token) {
      localStorage.setItem('access_token', data.access_token);
    }
    
    return data;
  },

  getCurrentUser: async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      throw new Error('No token found');
    }

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('access_token');
        throw new Error('Token expired');
      }
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  },

  logout: () => {
    localStorage.removeItem('access_token');
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check for existing authentication on component mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          console.log('🔑 Checking existing authentication...');
          const userData = await authAPI.getCurrentUser();
          console.log('✅ User authenticated:', userData);
          setUser(userData);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('❌ Auth check failed:', error);
          localStorage.removeItem('access_token');
          setIsAuthenticated(false);
          setUser(null);
        }
      } else {
        console.log('ℹ️ No auth token found');
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const signup = async (userData) => {
    try {
      setError(null);
      setIsLoading(true);
      
      console.log('📝 Attempting signup with:', { 
        username: userData.username, 
        email: userData.email 
      });
      
      const response = await authAPI.signup(userData);
      console.log('✅ Signup successful:', response.message);
      
      // After successful signup, automatically login
      console.log('🔑 Auto-login after signup...');
      await login({ 
        email: userData.email, 
        password: userData.password 
      });
      
      return response;
    } catch (error) {
      console.error('❌ Signup error:', error);
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setError(null);
      setIsLoading(true);
      
      console.log('🔑 Attempting login with:', credentials.email);
      const response = await authAPI.login(credentials);
      console.log('✅ Login response received');
      
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
      setError(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    try {
      console.log('🚪 Logging out user...');
      authAPI.logout();
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Even if logout fails, clear local state
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    // State
    user,
    isAuthenticated,
    isLoading,
    error,
    
    // Actions
    signup,
    login,
    logout,
    clearError,
    
    // Utility functions
    isTokenExpired: () => !localStorage.getItem('access_token'),
    getUserInfo: () => user
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
