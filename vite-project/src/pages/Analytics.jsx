import React from 'react';
import { Link } from 'react-router-dom';
import { useJobs } from '../context/JobContext';
import { StatusBarChart, StatusPieChart, ApplicationsTimelineChart } from '../components/Charts';

const Analytics = () => {
  const { getStats, jobs } = useJobs();
  const stats = getStats();

  // Prepare data for status charts
  const statusData = {
    Applied: stats.totalApplied,
    Interview: stats.totalInterviews,
    Offer: stats.totalOffers,
    Rejected: stats.totalRejected
  };

  // Generate dummy timeline data (for the last 6 months)
  const generateTimelineData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map(month => ({
      month,
      count: Math.floor(Math.random() * 5) + 1, // Random count between 1-5
    }));
  };

  const timelineData = generateTimelineData();

  return (
    <div className="p-6">
      {/* Navigation breadcrumb */}
      <div className="mb-6 flex items-center space-x-2 text-sm text-gray-600">
        <Link to="/dashboard" className="hover:text-blue-600 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Dashboard
        </Link>
        <span>/</span>
        <span className="text-gray-800">Analytics</span>
      </div>
      
      <h1 className="text-2xl font-bold mb-6">Analytics</h1>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-4 rounded shadow text-center">
          <p className="text-gray-600">Total Applications</p>
          <p className="text-3xl font-bold">{stats.totalJobs}</p>
        </div>
        <div className="bg-white p-4 rounded shadow text-center">
          <p className="text-gray-600">Interviews</p>
          <p className="text-3xl font-bold">{stats.totalInterviews}</p>
        </div>
        <div className="bg-white p-4 rounded shadow text-center">
          <p className="text-gray-600">Offers</p>
          <p className="text-3xl font-bold">{stats.totalOffers}</p>
        </div>
        <div className="bg-white p-4 rounded shadow text-center">
          <p className="text-gray-600">Response Rate</p>
          <p className="text-3xl font-bold">
            {stats.totalJobs ? Math.round((stats.totalInterviews / stats.totalJobs) * 100) : 0}%
          </p>
        </div>
      </div>
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Status Pie Chart */}
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-bold mb-4">Applications by Status</h2>
          <div className="max-w-sm mx-auto">
            <StatusPieChart data={statusData} />
          </div>
        </div>
        
        {/* Status Bar Chart */}
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-bold mb-4">Jobs by Status</h2>
          <div>
            <StatusBarChart data={statusData} />
          </div>
        </div>
        
        {/* Timeline Chart */}
        <div className="bg-white p-6 rounded shadow md:col-span-2">
          <h2 className="text-xl font-bold mb-4">Applications Over Time</h2>
          <div>
            <ApplicationsTimelineChart data={timelineData} />
          </div>
        </div>
      </div>
      
      {/* Additional Stats */}
      <div className="mt-8 bg-white p-6 rounded shadow">
        <h2 className="text-xl font-bold mb-4">Additional Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="font-medium mb-2">Most Applied Companies</h3>
            <ul className="space-y-2">
              {/* This would normally come from actual data analysis */}
              <li className="flex justify-between">
                <span>Tech Solutions Inc.</span>
                <span className="font-medium">2</span>
              </li>
              <li className="flex justify-between">
                <span>Other Companies</span>
                <span className="font-medium">1 each</span>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-2">Average Response Time</h3>
            <p className="text-2xl font-bold">7 days</p>
            <p className="text-sm text-gray-500">From application to first response</p>
          </div>
          <div>
            <h3 className="font-medium mb-2">Success Rate</h3>
            <p className="text-2xl font-bold">
              {stats.totalJobs ? Math.round((stats.totalOffers / stats.totalJobs) * 100) : 0}%
            </p>
            <p className="text-sm text-gray-500">Applications resulting in offers</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
