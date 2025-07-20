/**
 * API Service for CareerVault Backend - DynamoDB + Cognito Version
 * 
 * This module handles all HTTP requests to the FastAPI backend
 * using AWS Cognito authentication and DynamoDB data storage.
 */

const API_BASE_URL = 'http://localhost:8000';

// Helper function to get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('cognitoAccessToken');
};

// Helper function to get refresh token from localStorage
const getRefreshToken = () => {
  return localStorage.getItem('cognitoRefreshToken');
};

// Helper function to get ID token from localStorage
const getIdToken = () => {
  return localStorage.getItem('cognitoIdToken');
};

// Helper function to store Cognito tokens
const storeTokens = (tokenData) => {
  if (tokenData.access_token) {
    localStorage.setItem('cognitoAccessToken', tokenData.access_token);
  }
  if (tokenData.id_token) {
    localStorage.setItem('cognitoIdToken', tokenData.id_token);
  }
  if (tokenData.refresh_token) {
    localStorage.setItem('cognitoRefreshToken', tokenData.refresh_token);
  }
  if (tokenData.expires_in) {
    const expirationTime = Date.now() + (tokenData.expires_in * 1000);
    localStorage.setItem('tokenExpiration', expirationTime.toString());
  }
};

// Helper function to clear all tokens
const clearTokens = () => {
  localStorage.removeItem('cognitoAccessToken');
  localStorage.removeItem('cognitoIdToken');
  localStorage.removeItem('cognitoRefreshToken');
  localStorage.removeItem('tokenExpiration');
  // Clear legacy tokens if they exist
  localStorage.removeItem('authToken');
};

// Helper function to check if token is expired
const isTokenExpired = () => {
  const expiration = localStorage.getItem('tokenExpiration');
  if (!expiration) return true;
  return Date.now() > parseInt(expiration);
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

// Helper function to automatically refresh token if needed
const ensureValidToken = async () => {
  if (!getAuthToken() || isTokenExpired()) {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      try {
        await authAPI.refreshToken(refreshToken);
        return true;
      } catch (error) {
        console.error('Token refresh failed:', error);
        clearTokens();
        return false;
      }
    }
    return false;
  }
  return true;
};

// Authentication API calls
export const authAPI = {
  // User signup with Cognito
  signup: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: userData.username,
        email: userData.email,
        password: userData.password,
        given_name: userData.firstName,
        family_name: userData.lastName
      }),
    });
    return handleResponse(response);
  },

  // User login with Cognito
  login: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: credentials.email || credentials.username,
        password: credentials.password
      }),
    });
    const data = await handleResponse(response);
    
    // Store Cognito tokens
    storeTokens(data);
    
    return data;
  },

  // Get current user info from Cognito
  getCurrentUser: async () => {
    // Ensure we have a valid token
    const hasValidToken = await ensureValidToken();
    if (!hasValidToken) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Refresh Cognito tokens
  refreshToken: async (refreshToken = null) => {
    const token = refreshToken || getRefreshToken();
    if (!token) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: token }),
    });
    const data = await handleResponse(response);
    
    // Update tokens in localStorage
    storeTokens(data);
    
    return data;
  },

  // Logout (clear tokens and notify backend)
  logout: async () => {
    try {
      // Notify backend about logout (optional)
      const token = getAuthToken();
      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: getAuthHeaders(),
        });
      }
    } catch (error) {
      console.error('Logout notification failed:', error);
    } finally {
      // Always clear tokens locally
      clearTokens();
    }
  },

  // Get password requirements
  getPasswordRequirements: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/password-requirements`);
    return handleResponse(response);
  }
};

// Jobs API calls with automatic token refresh
export const jobsAPI = {
  // Get all jobs for current user
  getJobs: async (limit = null, statusFilter = null) => {
    const hasValidToken = await ensureValidToken();
    if (!hasValidToken) {
      throw new Error('Authentication required');
    }

    let url = `${API_BASE_URL}/api/jobs`;
    const params = new URLSearchParams();
    
    if (limit) params.append('limit', limit);
    if (statusFilter) params.append('status_filter', statusFilter);
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Get specific job by ID
  getJob: async (jobId) => {
    const hasValidToken = await ensureValidToken();
    if (!hasValidToken) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/api/jobs/${jobId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Create new job
  createJob: async (jobData) => {
    const hasValidToken = await ensureValidToken();
    if (!hasValidToken) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/api/jobs`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        company: jobData.company,
        position: jobData.position,
        status: jobData.status || 'Applied',
        application_link: jobData.applicationLink || jobData.application_link,
        salary_range: jobData.salaryRange || jobData.salary_range,
        location: jobData.location,
        job_type: jobData.jobType || jobData.job_type,
        job_description: jobData.jobDescription || jobData.job_description,
        notes: jobData.notes,
        interview_date: jobData.interviewDate || jobData.interview_date,
        follow_up_date: jobData.followUpDate || jobData.follow_up_date
      }),
    });
    return handleResponse(response);
  },

  // Update existing job
  updateJob: async (jobId, jobData) => {
    const hasValidToken = await ensureValidToken();
    if (!hasValidToken) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/api/jobs/${jobId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        company: jobData.company,
        position: jobData.position,
        status: jobData.status,
        application_link: jobData.applicationLink || jobData.application_link,
        salary_range: jobData.salaryRange || jobData.salary_range,
        location: jobData.location,
        job_type: jobData.jobType || jobData.job_type,
        job_description: jobData.jobDescription || jobData.job_description,
        notes: jobData.notes,
        interview_date: jobData.interviewDate || jobData.interview_date,
        follow_up_date: jobData.followUpDate || jobData.follow_up_date
      }),
    });
    return handleResponse(response);
  },

  // Delete job
  deleteJob: async (jobId) => {
    const hasValidToken = await ensureValidToken();
    if (!hasValidToken) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/api/jobs/${jobId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Update job status only
  updateJobStatus: async (jobId, status) => {
    const hasValidToken = await ensureValidToken();
    if (!hasValidToken) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/api/jobs/${jobId}/status?new_status=${status}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Get job statistics
  getJobStats: async () => {
    const hasValidToken = await ensureValidToken();
    if (!hasValidToken) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/api/jobs/stats`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Get jobs by status
  getJobsByStatus: async (status, limit = null) => {
    const hasValidToken = await ensureValidToken();
    if (!hasValidToken) {
      throw new Error('Authentication required');
    }

    let url = `${API_BASE_URL}/api/jobs/status/${status}`;
    if (limit) {
      url += `?limit=${limit}`;
    }

    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });
    return handleResponse(response);
  },

  // Bulk update status
  bulkUpdateStatus: async (jobIds, status) => {
    const hasValidToken = await ensureValidToken();
    if (!hasValidToken) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/api/jobs/bulk/status-update?new_status=${status}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(jobIds),
    });
    return handleResponse(response);
  },

  // Bulk delete jobs
  bulkDeleteJobs: async (jobIds) => {
    const hasValidToken = await ensureValidToken();
    if (!hasValidToken) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/api/jobs/bulk`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      body: JSON.stringify(jobIds),
    });
    return handleResponse(response);
  }
};

// Generic API utilities
export const apiUtils = {
  // Check if user is authenticated (updated for Cognito)
  isAuthenticated: () => {
    const token = getAuthToken();
    const expiration = localStorage.getItem('tokenExpiration');
    
    if (!token || !expiration) {
      return false;
    }
    
    // Check if token is expired
    return Date.now() < parseInt(expiration);
  },

  // Test API connection
  healthCheck: async () => {
    const response = await fetch(`${API_BASE_URL}/health`);
    return handleResponse(response);
  },

  // Get API info
  getApiInfo: async () => {
    const response = await fetch(`${API_BASE_URL}/api/info`);
    return handleResponse(response);
  },

  // Handle API errors (updated for Cognito)
  handleError: (error) => {
    console.error('API Error:', error);
    
    // Handle specific error cases
    if (error.message.includes('401') || error.message.includes('Authentication required')) {
      // Unauthorized - clear tokens and redirect
      clearTokens();
      window.location.href = '/login';
    }
    
    return error.message;
  },

  // Get user info from stored tokens (client-side)
  getStoredUserInfo: () => {
    const idToken = getIdToken();
    if (!idToken) return null;

    try {
      // Decode JWT payload (note: this is not secure validation, just for UI purposes)
      const payload = JSON.parse(atob(idToken.split('.')[1]));
      return {
        user_id: payload.sub,
        username: payload['cognito:username'],
        email: payload.email,
        given_name: payload.given_name,
        family_name: payload.family_name
      };
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  },

  // Force token refresh
  forceTokenRefresh: async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    return await authAPI.refreshToken(refreshToken);
  }
};
