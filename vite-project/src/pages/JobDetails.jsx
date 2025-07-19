import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useJobs } from '../context/JobContext';
import { useAuth } from '../context/AuthContext';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { jobs, deleteJob } = useJobs();
  const { isAuthenticated } = useAuth();
  
  // Redirect to auth page if user is not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
  }, [isAuthenticated, navigate]);
  
  // Find the job by ID (keep as string for MongoDB ObjectId)
  const job = jobs.find(j => j.id === id);
  
  // Show loading or redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="bg-[#1E1E1E] backdrop-blur-lg p-8 rounded-3xl shadow-xl border border-[#2C2C2C] text-center max-w-md w-full mx-4">
          <div className="w-16 h-16 bg-gradient-to-r from-[#0EA5E9] to-[#60A5FA] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-white animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#E5E7EB] mb-4">Redirecting...</h1>
          <p className="text-[#9CA3AF]">Please sign in to access this page.</p>
        </div>
      </div>
    );
  }
  
  // Handle when job is not found
  if (!job) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="bg-[#1E1E1E] backdrop-blur-lg p-8 rounded-3xl shadow-xl border border-[#2C2C2C] text-center max-w-md w-full mx-4">
          <div className="w-16 h-16 bg-gradient-to-r from-[#EF4444] to-[#F87171] rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#E5E7EB] mb-4">Job Application Not Found</h1>
          <p className="text-[#9CA3AF] mb-8">The job application you're looking for doesn't exist or has been removed from your tracker.</p>
          <Link
            to="/dashboard"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-[#0EA5E9] to-[#60A5FA] text-white font-semibold rounded-full hover:from-[#0284C7] hover:to-[#3B82F6] shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }
  
  // Enhanced status color mapping with icons
  const getStatusInfo = (status) => {
    const statusMap = {
      Applied: {
        color: 'bg-[#0EA5E9]/20 text-[#0EA5E9] border-[#0EA5E9]/30',
        icon: '📋',
        bgGradient: 'from-[#0EA5E9] to-[#60A5FA]'
      },
      Interview: {
        color: 'bg-[#EAB308]/20 text-[#EAB308] border-[#EAB308]/30',
        icon: '🎯',
        bgGradient: 'from-[#EAB308] to-[#F59E0B]'
      },
      Offer: {
        color: 'bg-[#22C55E]/20 text-[#22C55E] border-[#22C55E]/30',
        icon: '🎉',
        bgGradient: 'from-[#22C55E] to-[#10B981]'
      },
      Rejected: {
        color: 'bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/30',
        icon: '❌',
        bgGradient: 'from-[#EF4444] to-[#F87171]'
      },
    };
    return statusMap[status] || {
      color: 'bg-[#9CA3AF]/20 text-[#9CA3AF] border-[#9CA3AF]/30',
      icon: '📝',
      bgGradient: 'from-[#9CA3AF] to-[#6B7280]'
    };
  };
  
  // Handle delete button with enhanced confirmation
  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete the application for "${job.title}" at ${job.company}? This action cannot be undone.`)) {
      deleteJob(job.id);
      navigate('/dashboard');
    }
  };

  const statusInfo = getStatusInfo(job.status);

  return (
    <div className="min-h-screen bg-gray-50 animate-fadeIn">
      {/* Professional Header */}
      <div className="bg-white backdrop-blur-lg shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link 
                to="/dashboard" 
                className="p-2 rounded-full hover:bg-gray-100 transition-all duration-300 group"
              >
                <svg className="w-5 h-5 text-gray-500 transition-transform duration-300 group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
                <p className="text-gray-600">{job.company}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold border ${statusInfo.color} transition-all duration-300`}>
                <span className="mr-2">{statusInfo.icon}</span>
                {job.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="bg-white backdrop-blur-lg rounded-3xl shadow-xl border border-gray-200 overflow-hidden mb-8">
          <div className={`bg-gradient-to-r ${statusInfo.bgGradient} px-8 py-6`}>
            <div className="flex items-center justify-between">
              <div className="text-white">
                <h2 className="text-3xl font-bold mb-2">{job.title}</h2>
                <p className="text-white/90 text-lg font-medium">{job.company}</p>
              </div>
              <div className="text-white/90 text-right">
                <div className="text-4xl mb-2">{statusInfo.icon}</div>
                <p className="text-sm font-medium">Status: {job.status}</p>
              </div>
            </div>
          </div>

          {/* Application Details Grid */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Application Date */}
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 hover:border-blue-300">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Application Date</h3>
                </div>
                <p className="text-2xl font-bold text-gray-900">{new Date(job.dateApplied).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</p>
                <p className="text-gray-600 mt-2">
                  {Math.floor((new Date() - new Date(job.dateApplied)) / (1000 * 60 * 60 * 24))} days ago
                </p>
              </div>

              {/* Current Status */}
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 hover:border-blue-300">
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`w-10 h-10 bg-gradient-to-r ${statusInfo.bgGradient} rounded-xl flex items-center justify-center`}>
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Current Status</h3>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">{statusInfo.icon}</span>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{job.status}</p>
                    <p className="text-gray-600">Application stage</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Application Link Section */}
        <div className="bg-white backdrop-blur-lg rounded-3xl shadow-xl border border-gray-200 overflow-hidden mb-8">
          <div className="p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Application Link</h2>
                <p className="text-gray-600">Original job posting reference</p>
              </div>
            </div>
            {job.applicationLink ? (
              <div className="bg-green-50 rounded-2xl p-6 border border-green-200">
                <a
                  href={job.applicationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-3 text-green-600 hover:text-green-700 font-medium text-lg group transition-all duration-300"
                >
                  <svg className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  <span className="break-all">{job.applicationLink}</span>
                </a>
                <p className="text-green-600/80 mt-2 text-sm">Click to open in new tab</p>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                <div className="flex items-center space-x-3 text-gray-600">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="font-medium">No application link provided</span>
                </div>
                <p className="text-gray-500 mt-2 text-sm">Add the job posting URL by editing this application</p>
              </div>
            )}
          </div>
        </div>

        {/* Notes Section */}
        <div className="bg-white backdrop-blur-lg rounded-3xl shadow-xl border border-gray-200 overflow-hidden mb-8">
          <div className="p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Application Notes</h2>
                <p className="text-gray-600">Your personal observations and updates</p>
              </div>
            </div>
            {job.notes ? (
              <div className="bg-purple-50 rounded-2xl p-6 border border-purple-200">
                <div className="prose prose-slate max-w-none">
                  <p className="text-gray-900 leading-relaxed whitespace-pre-line text-lg">{job.notes}</p>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                <div className="flex items-center space-x-3 text-gray-600">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span className="font-medium">No notes added yet</span>
                </div>
                <p className="text-gray-500 mt-2 text-sm">Add interview details, follow-up actions, or other important information by editing this application</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
          <Link
            to={`/edit-job/${job.id}`}
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-full hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 group"
          >
            <svg className="w-5 h-5 mr-3 transition-transform duration-300 group-hover:rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Application
          </Link>
          <button
            onClick={handleDelete}
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white font-bold rounded-full hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl transition-all duration-300 group"
          >
            <svg className="w-5 h-5 mr-3 transition-transform duration-300 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete Application
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
