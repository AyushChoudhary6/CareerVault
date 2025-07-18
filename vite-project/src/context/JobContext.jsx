import React, { createContext, useContext, useState, useEffect } from 'react';
import { jobsAPI, apiUtils } from '../services/api';
import { useAuth } from './AuthContext';

// Create context
const JobContext = createContext();

// Custom hook to use the job context
export const useJobs = () => {
  const context = useContext(JobContext);
  if (!context) {
    throw new Error('useJobs must be used within a JobProvider');
  }
  return context;
};

// Provider component
export const JobProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({});

  // Load jobs when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadJobs();
      loadStats();
    } else {
      // Clear jobs when user logs out
      setJobs([]);
      setFilteredJobs([]);
      setStats({});
    }
  }, [isAuthenticated]);

  // Load all jobs from backend
  const loadJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const jobsData = await jobsAPI.getJobs();
      
      // Map backend data to frontend format
      const mappedJobs = jobsData.map(job => ({
        id: job.id,
        title: job.position,
        company: job.company,
        status: job.status,
        dateApplied: job.applied_date,
        applicationLink: job.application_link,
        notes: job.notes,
      }));
      
      setJobs(mappedJobs);
      setFilteredJobs(mappedJobs);
      
      console.log('Jobs loaded:', mappedJobs.length);
    } catch (error) {
      const errorMessage = apiUtils.handleError(error);
      setError(errorMessage);
      console.error('Failed to load jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load job statistics
  const loadStats = async () => {
    try {
      const statsData = await jobsAPI.getJobStats();
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  // Add a new job
  const addJob = async (jobData) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🏢 addJob called with data:', jobData);
      console.log('🔐 User authenticated:', isAuthenticated);
      console.log('👤 Current user exists:', !!user);
      console.log('🎫 Auth token:', localStorage.getItem('authToken') ? 'exists' : 'missing');
      
      if (!isAuthenticated) {
        console.error('❌ User not authenticated, cannot add job');
        throw new Error('User not authenticated. Please log in first.');
      }
      
      // Map frontend field names to backend field names
      const backendJobData = {
        company: jobData.company,
        position: jobData.title, // title -> position
        status: jobData.status,
        applied_date: jobData.dateApplied, // dateApplied -> applied_date
        application_link: jobData.applicationLink, // applicationLink -> application_link
        notes: jobData.notes || null,
      };
      
      console.log('Sending to backend:', backendJobData);
      
      const newJob = await jobsAPI.createJob(backendJobData);
      
      console.log('Backend response:', newJob);
      
      // Map backend response back to frontend format
      const frontendJob = {
        id: newJob.id,
        title: newJob.position,
        company: newJob.company,
        status: newJob.status,
        dateApplied: newJob.applied_date,
        applicationLink: newJob.application_link,
        notes: newJob.notes,
      };
      
      const updatedJobs = [...jobs, frontendJob];
      setJobs(updatedJobs);
      setFilteredJobs(updatedJobs);
      
      // Reload stats
      await loadStats();
      
      console.log('Job added successfully:', frontendJob);
      return frontendJob;
    } catch (error) {
      const errorMessage = apiUtils.handleError(error);
      setError(errorMessage);
      console.error('Error in addJob:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update an existing job
  const updateJob = async (updatedJobData) => {
    try {
      setLoading(true);
      setError(null);
      
      // Map frontend field names to backend field names
      const backendJobData = {
        company: updatedJobData.company,
        position: updatedJobData.title,
        status: updatedJobData.status,
        applied_date: updatedJobData.dateApplied,
        application_link: updatedJobData.applicationLink,
        notes: updatedJobData.notes || null,
      };
      
      const updatedJob = await jobsAPI.updateJob(updatedJobData.id, backendJobData);
      
      // Map backend response back to frontend format
      const frontendJob = {
        id: updatedJob.id,
        title: updatedJob.position,
        company: updatedJob.company,
        status: updatedJob.status,
        dateApplied: updatedJob.applied_date,
        applicationLink: updatedJob.application_link,
        notes: updatedJob.notes,
      };
      
      const updatedJobs = jobs.map(job => 
        job.id === frontendJob.id ? frontendJob : job
      );
      
      setJobs(updatedJobs);
      setFilteredJobs(updatedJobs);
      
      // Reload stats
      await loadStats();
      
      console.log('Job updated successfully:', frontendJob);
      return frontendJob;
    } catch (error) {
      const errorMessage = apiUtils.handleError(error);
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Delete a job
  const deleteJob = async (jobId) => {
    try {
      setLoading(true);
      setError(null);
      
      await jobsAPI.deleteJob(jobId);
      
      const updatedJobs = jobs.filter(job => job.id !== jobId);
      setJobs(updatedJobs);
      setFilteredJobs(updatedJobs);
      
      // Reload stats
      await loadStats();
      
      console.log('Job deleted successfully:', jobId);
    } catch (error) {
      const errorMessage = apiUtils.handleError(error);
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Get job by ID
  const getJobById = async (jobId) => {
    try {
      const job = await jobsAPI.getJob(jobId);
      
      // Map backend response to frontend format
      return {
        id: job.id,
        title: job.position,
        company: job.company,
        status: job.status,
        dateApplied: job.applied_date,
        applicationLink: job.application_link,
        notes: job.notes,
      };
    } catch (error) {
      const errorMessage = apiUtils.handleError(error);
      setError(errorMessage);
      throw error;
    }
  };

  // Filter jobs
  const filterJobs = (searchTerm = '', statusFilter = '', companyFilter = '') => {
    let filtered = [...jobs];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter) {
      filtered = filtered.filter(job => job.status === statusFilter);
    }

    // Company filter
    if (companyFilter) {
      filtered = filtered.filter(job => job.company === companyFilter);
    }

    setFilteredJobs(filtered);
  };

  // Get unique companies
  const getCompanies = () => {
    return [...new Set(jobs.map(job => job.company))].sort();
  };

  // Get unique statuses
  const getStatuses = () => {
    return [...new Set(jobs.map(job => job.status))].sort();
  };

  // Get statistics
  const getStats = () => {
    const totalJobs = jobs.length;
    const statusCounts = jobs.reduce((acc, job) => {
      acc[job.status] = (acc[job.status] || 0) + 1;
      return acc;
    }, {});

    return {
      totalJobs,
      totalApplied: statusCounts.Applied || 0,
      totalInterviews: statusCounts.Interview || 0,
      totalOffers: statusCounts.Offer || 0,
      totalRejected: statusCounts.Rejected || 0,
      ...stats,
    };
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Refresh jobs
  const refreshJobs = () => {
    loadJobs();
    loadStats();
  };

  const value = {
    jobs,
    filteredJobs,
    loading,
    error,
    stats,
    addJob,
    updateJob,
    deleteJob,
    getJobById,
    filterJobs,
    getCompanies,
    getStatuses,
    getStats,
    clearError,
    refreshJobs,
  };

  return <JobContext.Provider value={value}>{children}</JobContext.Provider>;
};
