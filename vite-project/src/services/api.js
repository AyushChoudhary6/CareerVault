/**
 * API Service for CareerVault Backend - Simple JWT Version
 * 
 * This module handles all HTTP requests to the FastAPI backend
 * using JWT authentication and AWS DynamoDB data storage.
 */

const API_BASE_URL = 'http://careervault-alb-811389921.ap-south-1.elb.amazonaws.com';

// Helper function to get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('access_token');
};

// Helper function to get authorization headers
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Authentication API calls
export const authAPI = {
  // User signup
  signup: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  },

  // User login
  login: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    const data = await handleResponse(response);
    
    // Store JWT token
    if (data.access_token) {
      localStorage.setItem('access_token', data.access_token);
    }
    
    return data;
  },

  // Get current user info
  getCurrentUser: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Logout
  logout: () => {
    localStorage.removeItem('access_token');
  }
};

// Jobs API calls
export const jobsAPI = {
  // Get all jobs for current user
  getJobs: async () => {
    const response = await fetch(`${API_BASE_URL}/api/jobs`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Get specific job by ID
  getJob: async (jobId) => {
    const response = await fetch(`${API_BASE_URL}/api/jobs/${jobId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Create new job
  createJob: async (jobData) => {
    const response = await fetch(`${API_BASE_URL}/api/jobs`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(jobData),
    });
    return handleResponse(response);
  },

  // Update job
  updateJob: async (jobId, jobData) => {
    const response = await fetch(`${API_BASE_URL}/api/jobs/${jobId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(jobData),
    });
    return handleResponse(response);
  },

  // Delete job
  deleteJob: async (jobId) => {
    const response = await fetch(`${API_BASE_URL}/api/jobs/${jobId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }
    
    // For delete, we might get 204 No Content or a success message
    if (response.status === 204) {
      return { message: 'Job deleted successfully' };
    }
    
    return response.json();
  },

  // Get job statistics
  getJobStats: async () => {
    const response = await fetch(`${API_BASE_URL}/api/jobs/stats/summary`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  }
};

// AI Career Assistant API (if needed)
export const aiAPI = {
  // Get career advice
  getCareerAdvice: async (prompt) => {
    const response = await fetch(`${API_BASE_URL}/ai/career-advice`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ prompt }),
    });
    return handleResponse(response);
  },

  // Resume analysis (if implemented)
  analyzeResume: async (resumeText) => {
    const response = await fetch(`${API_BASE_URL}/ai/analyze-resume`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ resume_text: resumeText }),
    });
    return handleResponse(response);
  }
};

// Utility functions
export const apiUtils = {
  // Check if user is authenticated
  isAuthenticated: () => {
    return !!getAuthToken();
  },

  // Get stored user info (basic info from token if needed)
  getStoredUserInfo: () => {
    const token = getAuthToken();
    if (!token) return null;
    
    // For simple JWT, we can decode basic info if needed
    // This is just for UI purposes - always verify on server
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        user_id: payload.user_id,
        email: payload.email,
        exp: payload.exp
      };
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  },

  // Check if token is expired
  isTokenExpired: () => {
    const userInfo = apiUtils.getStoredUserInfo();
    if (!userInfo || !userInfo.exp) return true;
    
    const currentTime = Date.now() / 1000;
    return userInfo.exp < currentTime;
  },

  // Handle API errors
  handleError: (error) => {
    if (error.message.includes('401') || error.message.includes('Token expired')) {
      // Token expired, logout user
      authAPI.logout();
      window.location.href = '/auth';
      return 'Session expired. Please login again.';
    }
    return error.message || 'An unexpected error occurred';
  }
};

// Default export with all APIs
export default {
  auth: authAPI,
  jobs: jobsAPI,
  ai: aiAPI,
  utils: apiUtils
};
