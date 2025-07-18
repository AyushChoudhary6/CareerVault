import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useJobs } from '../context/JobContext';

const AddJob = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { jobs, addJob, updateJob } = useJobs();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    title: '',
    company: '',
    applicationLink: '',
    notes: '',
    status: 'Applied',
    dateApplied: new Date().toISOString().split('T')[0] // Today's date in YYYY-MM-DD
  });

  // Load job data if editing
  useEffect(() => {
    if (isEditing) {
      const jobToEdit = jobs.find(job => job.id === id);
      if (jobToEdit) {
        setFormData(jobToEdit);
      }
    }
  }, [isEditing, id, jobs]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('Form data submitted:', formData);
    
    try {
      if (isEditing) {
        await updateJob({ ...formData, id: id });
      } else {
        await addJob(formData);
      }
      
      // Navigate back to jobs list only after successful submission
      navigate('/jobs');
    } catch (error) {
      console.error('Error saving job:', error);
      // You could add user feedback here, like a toast notification
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modern Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/jobs')}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-2xl font-semibold text-gray-900">
                {isEditing ? 'Edit Job Application' : 'Add New Job Application'}
              </h1>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>•</span>
              <span>Keep your applications organized</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Form Header */}
          <div className="bg-gradient-to-r from-sky-50 to-blue-50 px-8 py-6 border-b border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-sky-500 to-blue-600 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {isEditing ? 'Update Application Details' : 'Create New Application'}
                </h2>
                <p className="text-gray-600 mt-1">
                  {isEditing ? 'Make changes to your job application' : 'Add a new job application to track your progress'}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Job Title*
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Senior Software Engineer"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Company Name*
                </label>
                <input
                  type="text"
                  name="company"
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="e.g. Google, Microsoft, Apple"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Application Link
                </label>
                <input
                  type="url"
                  name="applicationLink"
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                  value={formData.applicationLink}
                  onChange={handleChange}
                  placeholder="https://company.com/careers/job-id"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Date Applied*
                </label>
                <input
                  type="date"
                  name="dateApplied"
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                  value={formData.dateApplied}
                  onChange={handleChange}
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Status*
                </label>
                <select
                  name="status"
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="Applied">Applied</option>
                  <option value="Interview">Interview</option>
                  <option value="Offer">Offer</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>
            
            <div className="mt-8">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Notes
              </label>
              <textarea
                name="notes"
                rows="6"
                className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white resize-none"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Add any additional notes about this application, interview details, or follow-up actions..."
              ></textarea>
            </div>
            
            <div className="mt-10 flex items-center justify-end space-x-4">
              <button
                type="button"
                className="px-8 py-3 bg-white text-gray-700 font-medium rounded-full border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
                onClick={() => navigate('/jobs')}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-8 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold rounded-full hover:from-sky-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{isEditing ? 'Update Application' : 'Save Application'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddJob;
