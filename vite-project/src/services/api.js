/**
 * API Service for Job Tracker Backend
 * 
 * This module handles all HTTP requests to the FastAPI backend
 * including authentication and job management operations.
 */

const API_BASE_URL = 'http://localhost:8000';

// Helper function to get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Helper function to create headers with auth token
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
    
    // Store token in localStorage
    if (data.access_token) {
      localStorage.setItem('authToken', data.access_token);
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

  // Refresh token
  refreshToken: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    const data = await handleResponse(response);
    
    // Update token in localStorage
    if (data.access_token) {
      localStorage.setItem('authToken', data.access_token);
    }
    
    return data;
  },

  // Logout (clear local storage)
  logout: () => {
    localStorage.removeItem('authToken');
  },
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

  // Update existing job
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
    return handleResponse(response);
  },

  // Get job statistics
  getJobStats: async () => {
    const response = await fetch(`${API_BASE_URL}/api/jobs/stats/summary`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },
};

// Generic API utilities
export const apiUtils = {
  // Check if user is authenticated
  isAuthenticated: () => {
    return !!getAuthToken();
  },

  // Test API connection
  healthCheck: async () => {
    const response = await fetch(`${API_BASE_URL}/`);
    return handleResponse(response);
  },

  // Handle API errors
  handleError: (error) => {
    console.error('API Error:', error);
    
    // Handle specific error cases
    if (error.message.includes('401')) {
      // Unauthorized - token might be expired
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    
    return error.message;
  },
};
