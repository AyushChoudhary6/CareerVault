import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const JobCard = ({ job, index = 0 }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const statusColors = {
    Applied: 'bg-blue-100 text-blue-700 border-blue-300',
    Interview: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    Offer: 'bg-green-100 text-green-700 border-green-300',
    Rejected: 'bg-red-100 text-red-700 border-red-300',
    'Follow Up': 'bg-purple-100 text-purple-700 border-purple-300',
    'Pending': 'bg-gray-100 text-gray-700 border-gray-300',
  };

  // Animation delay based on index
  const getAnimationDelay = () => {
    const baseDelay = 100;
    return `${baseDelay * (index % 10)}ms`;
  };

  // Function to get company logo initial
  const getCompanyInitial = (companyName) => {
    return companyName.charAt(0).toUpperCase();
  };

  return (
    <div 
      className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 mb-4 animate-scale-in"
      style={{ animationDelay: getAnimationDelay() }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className={`w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-xl font-bold text-white shadow-sm transform transition-all duration-500 ${isHovered ? 'scale-110 shadow-md' : ''}`}>
            {getCompanyInitial(job.company)}
          </div>
        </div>
        <div className="flex-grow">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h3 className="text-lg font-bold text-gray-800">{job.title}</h3>
              <p className="text-md text-gray-600">{job.company}</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium border ${statusColors[job.status]}`}>
              {job.status}
            </div>
          </div>
          <div className="flex flex-wrap gap-3 mt-4">
            <div className="flex items-center text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Applied: {job.dateApplied}
            </div>
            {job.location && (
              <div className="flex items-center text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {job.location}
              </div>
            )}
            {job.salary && (
              <div className="flex items-center text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {job.salary}
              </div>
            )}
          </div>
          
          {job.notes && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
              <p className="text-sm text-gray-600 line-clamp-2">
                <span className="font-medium text-gray-700">Notes: </span>
                {job.notes}
              </p>
            </div>
          )}
          
          <div className="mt-5 flex justify-between items-center border-t border-gray-100 pt-4">
            <Link 
              to={`/jobs/${job.id}`} 
              className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center py-2 px-4 rounded-lg hover:bg-blue-50 transition-all duration-300 relative overflow-hidden group"
            >
              <span className="relative z-10 flex items-center">
                <span>View Details</span>
                <svg xmlns="http://www.w3.org/2000/svg" 
                  className="h-4 w-4 ml-1 transform transition-transform duration-300 group-hover:translate-x-1" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
              <span className="absolute inset-0 bg-blue-50 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
            </Link>
            <div className="flex space-x-2">
              <button className="text-gray-400 hover:text-blue-600 p-2 rounded-full hover:bg-blue-50 transition-all duration-300 transform hover:scale-110">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button className="text-gray-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-all duration-300 transform hover:scale-110">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobCard;
