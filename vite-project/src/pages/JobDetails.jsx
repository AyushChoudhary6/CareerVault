import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useJobs } from '../context/JobContext';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { jobs, deleteJob } = useJobs();
  
  // Find the job by ID (keep as string for MongoDB ObjectId)
  const job = jobs.find(j => j.id === id);
  
  // Handle when job is not found
  if (!job) {
    return (
      <div className="p-6">
        <div className="bg-white p-6 rounded shadow text-center">
          <h1 className="text-2xl font-bold mb-4">Job Not Found</h1>
          <p className="mb-6">The job you're looking for doesn't exist or has been removed.</p>
          <Link
            to="/jobs"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Back to Jobs
          </Link>
        </div>
      </div>
    );
  }
  
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
  
  // Handle delete button
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this job application?')) {
      deleteJob(job.id);
      navigate('/jobs');
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{job.title}</h1>
        <div className="flex space-x-2">
          <Link
            to={`/edit-job/${job.id}`}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Edit
          </Link>
          <button
            onClick={handleDelete}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded shadow">
        {/* Header info */}
        <div className="border-b p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-lg font-medium">
                {job.company}
              </p>
              <p className="text-gray-500">
                Applied on: {job.dateApplied}
              </p>
            </div>
            <div className="md:text-right">
              <span className={`px-3 py-1 rounded text-sm ${getStatusColor(job.status)}`}>
                {job.status}
              </span>
            </div>
          </div>
        </div>
        
        {/* Details */}
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-lg font-medium mb-2">Application Link</h2>
            {job.applicationLink ? (
              <a
                href={job.applicationLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {job.applicationLink}
              </a>
            ) : (
              <p className="text-gray-500">No application link provided</p>
            )}
          </div>
          
          <div className="mb-6">
            <h2 className="text-lg font-medium mb-2">Notes</h2>
            {job.notes ? (
              <p className="whitespace-pre-line">{job.notes}</p>
            ) : (
              <p className="text-gray-500">No notes added</p>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-6">
        <Link
          to="/jobs"
          className="text-blue-600 hover:underline"
        >
          ← Back to Jobs
        </Link>
      </div>
    </div>
  );
};

export default JobDetails;
