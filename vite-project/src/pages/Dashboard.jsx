import React from 'react';
import { Link } from 'react-router-dom';
import { useJobs } from '../context/JobContext';
import { StatusPieChart } from '../components/Charts';

const Dashboard = () => {
  const { getStats } = useJobs();
  const stats = getStats();

  const chartData = {
    Applied: stats.totalApplied,
    Interview: stats.totalInterviews,
    Offer: stats.totalOffers,
    Rejected: stats.totalRejected
  };

  // Calculate success rate
  const successRate = stats.totalJobs > 0 
    ? Math.round((stats.totalOffers / stats.totalJobs) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modern Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-500">
                <span>•</span>
                <span>Welcome back</span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Link 
                to="/add-job" 
                className="inline-flex items-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-sky-500 hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors"
              >
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Job
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <Link to="/jobs" className="group">
            <div className="relative bg-white overflow-hidden shadow-sm rounded-2xl hover:shadow-md transition-shadow duration-200 border border-gray-100">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Applications</dt>
                      <dd className="text-lg font-semibold text-gray-900">{stats.totalJobs}</dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <span className="text-gray-600">All job applications</span>
                </div>
              </div>
            </div>
          </Link>

          <Link to="/jobs?status=Interview" className="group">
            <div className="relative bg-white overflow-hidden shadow-sm rounded-2xl hover:shadow-md transition-shadow duration-200 border border-gray-100">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Interviews</dt>
                      <dd className="text-lg font-semibold text-gray-900">{stats.totalInterviews}</dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <span className="text-gray-600">{Math.round((stats.totalInterviews / (stats.totalJobs || 1)) * 100)}% of applications</span>
                </div>
              </div>
            </div>
          </Link>

          <Link to="/jobs?status=Offer" className="group">
            <div className="relative bg-white overflow-hidden shadow-sm rounded-2xl hover:shadow-md transition-shadow duration-200 border border-gray-100">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Offers</dt>
                      <dd className="text-lg font-semibold text-gray-900">{stats.totalOffers}</dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <span className="text-sky-600 font-medium">{successRate}% success rate</span>
                </div>
              </div>
            </div>
          </Link>

          <Link to="/jobs?status=Rejected" className="group">
            <div className="relative bg-white overflow-hidden shadow-sm rounded-2xl hover:shadow-md transition-shadow duration-200 border border-gray-100">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Rejected</dt>
                      <dd className="text-lg font-semibold text-gray-900">{stats.totalRejected}</dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <div className="text-sm">
                  <span className="text-red-500">{Math.round((stats.totalRejected / (stats.totalJobs || 1)) * 100)}% of applications</span>
                </div>
              </div>
            </div>
          </Link>
        </div>
        
        {/* Main Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart Section */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow-sm rounded-2xl border border-gray-100">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Application Status Overview</h3>
              </div>
              <div className="p-6">
                <div className="mx-auto max-w-md">
                  <StatusPieChart data={chartData} />
                </div>
              </div>
            </div>
          </div>
          
          {/* Activity Timeline */}
          <div className="bg-white shadow-sm rounded-2xl border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
            </div>
            <div className="p-6">
              <div className="flow-root">
                <ul className="-mb-8">
                  <li>
                    <div className="relative pb-8">
                      <div className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"></div>
                      <div className="relative flex space-x-3">
                        <div className="h-8 w-8 rounded-full bg-sky-500 flex items-center justify-center">
                          <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div>
                            <p className="text-sm text-gray-500">Added new application</p>
                            <p className="text-xs text-gray-400">2 hours ago</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                  <li>
                    <div className="relative pb-8">
                      <div className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"></div>
                      <div className="relative flex space-x-3">
                        <div className="h-8 w-8 rounded-full bg-sky-500 flex items-center justify-center">
                          <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div>
                            <p className="text-sm text-gray-500">Interview scheduled</p>
                            <p className="text-xs text-gray-400">Yesterday</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                  <li>
                    <div className="relative">
                      <div className="relative flex space-x-3">
                        <div className="h-8 w-8 rounded-full bg-sky-500 flex items-center justify-center">
                          <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                          <div>
                            <p className="text-sm text-gray-500">Profile updated</p>
                            <p className="text-xs text-gray-400">3 days ago</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
