import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useJobs } from '../context/JobContext';
import { useAuth } from '../context/AuthContext';

const JobList = () => {
  const { isAuthenticated } = useAuth();
  const { filteredJobs, filterJobs, getCompanies, getStatuses } = useJobs();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const location = useLocation();

  // Get unique companies and statuses for filters
  const companies = getCompanies();
  const statuses = getStatuses();

  // Handle URL parameters for filtering
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const statusParam = urlParams.get('status');
    if (statusParam) {
      setStatusFilter(statusParam);
      filterJobs(searchTerm, statusParam, companyFilter);
    }
  }, [location.search]);

  // Handle search and filter changes
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    filterJobs(e.target.value, statusFilter, companyFilter);
  };

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    filterJobs(searchTerm, e.target.value, companyFilter);
  };

  const handleCompanyChange = (e) => {
    setCompanyFilter(e.target.value);
    filterJobs(searchTerm, statusFilter, e.target.value);
  };

  // Status color mapping
  const getStatusColor = (status) => {
    const colors = {
      Applied: 'bg-blue-100 text-blue-800',
      Interview: 'bg-yellow-100 text-yellow-800',
      Offer: 'bg-green-100 text-green-800',
      Rejected: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modern Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link to="/dashboard" className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <h1 className="text-2xl font-semibold text-gray-900">Job Applications</h1>
              {statusFilter && (
                <span className="px-3 py-1 bg-sky-100 text-sky-700 rounded-full text-sm font-medium">
                  {statusFilter}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <Link 
                to="/add-job" 
                className="inline-flex items-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-sky-500 hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors"
              >
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add New Job
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Search and Filters */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-sky-50 to-blue-50 px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Search & Filter Applications</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Search</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search jobs..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                    value={searchTerm}
                    onChange={handleSearch}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Filter by Status</label>
                <select
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                  value={statusFilter}
                  onChange={handleStatusChange}
                >
                  <option value="">All Statuses</option>
                  {statuses.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Filter by Company</label>
                <select
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                  value={companyFilter}
                  onChange={handleCompanyChange}
                >
                  <option value="">All Companies</option>
                  {companies.map(company => (
                    <option key={company} value={company}>{company}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Jobs Table */}
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-sky-50 to-blue-50 px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Your Applications</h2>
          </div>
          {filteredJobs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Job Title</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Company</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date Applied</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredJobs.map((job, index) => (
                    <tr 
                      key={job.id} 
                      className="hover:bg-gray-50 transition-all duration-300 transform hover:scale-[1.01] hover:shadow-md stagger-item group"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{job.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{job.company}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                          {job.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{job.dateApplied}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link 
                          to={`/jobs/${job.id}`} 
                          className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-sky-600 hover:text-sky-800 bg-sky-50 hover:bg-sky-100 rounded-full transition-colors"
                        >
                          View
                          <svg className="ml-1 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              
              {!isAuthenticated ? (
                <>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Please log in to view your applications</h3>
                  <p className="text-gray-500 mb-6">Sign up or log in to start tracking your job applications.</p>
                  <Link
                    to="/auth"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-sky-500 hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors"
                  >
                    <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Login / Sign Up
                  </Link>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
                  <p className="text-gray-500 mb-6">Try adjusting your filters or add a new job application.</p>
                  <Link
                    to="/add-job"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-sky-500 hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors"
                  >
                    <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Your First Job
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobList;
