import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useJobs } from '../context/JobContext';
import { StatusPieChart } from '../components/Charts';

const Dashboard = () => {
  const { getStats } = useJobs();
  const stats = getStats();
  
  // State for reminders
  const [reminders, setReminders] = useState([
    {
      id: 1,
      title: "Follow up with Google",
      description: "Send thank you email after interview",
      dueDate: "2025-07-20",
      priority: "high",
      completed: false
    },
    {
      id: 2,
      title: "Prepare for Microsoft interview",
      description: "Review system design concepts",
      dueDate: "2025-07-22",
      priority: "medium",
      completed: false
    }
  ]);
  
  const [newReminder, setNewReminder] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "medium"
  });
  
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Add new reminder
  const addReminder = (e) => {
    e.preventDefault();
    if (!newReminder.title.trim()) return;
    
    const reminder = {
      id: Date.now(),
      ...newReminder,
      completed: false
    };
    
    setReminders([reminder, ...reminders]);
    setNewReminder({ title: "", description: "", dueDate: "", priority: "medium" });
    setShowAddForm(false);
  };
  
  // Toggle reminder completion
  const toggleReminder = (id) => {
    setReminders(reminders.map(reminder => 
      reminder.id === id ? { ...reminder, completed: !reminder.completed } : reminder
    ));
  };
  
  // Delete reminder
  const deleteReminder = (id) => {
    setReminders(reminders.filter(reminder => reminder.id !== id));
  };
  
  // Priority colors
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

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
    <div className="min-h-screen bg-gray-50 page-container animate-fadeIn">
      {/* Modern Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 animate-slide-in-left">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-semibold text-gray-900 animate-fade-in animation-delay-200">Dashboard</h1>
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-500 animate-fade-in animation-delay-300">
                <span>•</span>
                <span>Welcome back</span>
              </div>
            </div>
            <div className="flex items-center space-x-3 animate-slide-in-right animation-delay-500">
              <Link 
                to="/add-job" 
                className="inline-flex items-center px-6 py-2.5 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-sky-500 hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-all duration-300 transform hover:scale-105 btn-shine group"
              >
                <svg className="h-4 w-4 mr-2 transition-transform duration-300 group-hover:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8 animate-fade-in animation-delay-700">
          <Link to="/jobs" className="group stagger-item">
            <div className="relative bg-white overflow-hidden shadow-sm rounded-2xl hover:shadow-lg transition-all duration-300 border border-gray-100 smooth-hover transform-gpu">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-sky-200">
                      <svg className="w-5 h-5 text-sky-600 transition-transform duration-300 group-hover:rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate group-hover:text-gray-600 transition-colors duration-300">Total Applications</dt>
                      <dd className="text-lg font-semibold text-gray-900 group-hover:text-sky-700 transition-colors duration-300">{stats.totalJobs}</dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3 group-hover:bg-sky-50 transition-colors duration-300">
                <div className="text-sm">
                  <span className="text-gray-600 group-hover:text-sky-600 transition-colors duration-300">All job applications</span>
                </div>
              </div>
            </div>
          </Link>

          <Link to="/jobs?status=Interview" className="group stagger-item">
            <div className="relative bg-white overflow-hidden shadow-sm rounded-2xl hover:shadow-lg transition-all duration-300 border border-gray-100 smooth-hover transform-gpu">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-yellow-200">
                      <svg className="w-5 h-5 text-yellow-600 transition-transform duration-300 group-hover:rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate group-hover:text-gray-600 transition-colors duration-300">Interviews</dt>
                      <dd className="text-lg font-semibold text-gray-900 group-hover:text-yellow-700 transition-colors duration-300">{stats.totalInterviews}</dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3 group-hover:bg-yellow-50 transition-colors duration-300">
                <div className="text-sm">
                  <span className="text-gray-600 group-hover:text-yellow-600 transition-colors duration-300">{Math.round((stats.totalInterviews / (stats.totalJobs || 1)) * 100)}% of applications</span>
                </div>
              </div>
            </div>
          </Link>

          <Link to="/jobs?status=Offer" className="group stagger-item">
            <div className="relative bg-white overflow-hidden shadow-sm rounded-2xl hover:shadow-lg transition-all duration-300 border border-gray-100 smooth-hover transform-gpu">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-green-200">
                      <svg className="w-5 h-5 text-green-600 transition-transform duration-300 group-hover:rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate group-hover:text-gray-600 transition-colors duration-300">Offers</dt>
                      <dd className="text-lg font-semibold text-gray-900 group-hover:text-green-700 transition-colors duration-300">{stats.totalOffers}</dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3 group-hover:bg-green-50 transition-colors duration-300">
                <div className="text-sm">
                  <span className="text-green-600 font-medium group-hover:text-green-700 transition-colors duration-300">{successRate}% success rate</span>
                </div>
              </div>
            </div>
          </Link>

          <Link to="/jobs?status=Rejected" className="group stagger-item">
            <div className="relative bg-white overflow-hidden shadow-sm rounded-2xl hover:shadow-lg transition-all duration-300 border border-gray-100 smooth-hover transform-gpu">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-red-200">
                      <svg className="w-5 h-5 text-red-600 transition-transform duration-300 group-hover:rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate group-hover:text-gray-600 transition-colors duration-300">Rejected</dt>
                      <dd className="text-lg font-semibold text-gray-900 group-hover:text-red-700 transition-colors duration-300">{stats.totalRejected}</dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3 group-hover:bg-red-50 transition-colors duration-300">
                <div className="text-sm">
                  <span className="text-red-500 group-hover:text-red-600 transition-colors duration-300">{Math.round((stats.totalRejected / (stats.totalJobs || 1)) * 100)}% of applications</span>
                </div>
              </div>
            </div>
          </Link>
        </div>
        
        {/* Main Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in animation-delay-1000">
          {/* Chart Section */}
          <div className="lg:col-span-2 stagger-item">
            <div className="bg-white shadow-sm rounded-2xl border border-gray-100 smooth-hover transition-all duration-300">
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
          
          {/* Reminders Section */}
          <div className="bg-white shadow-sm rounded-2xl border border-gray-100 smooth-hover transition-all duration-300 stagger-item">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Reminders</h3>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-full text-white bg-sky-500 hover:bg-sky-600 transition-all duration-300 transform hover:scale-105 btn-shine focus-ring"
              >
                <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Reminder
              </button>
            </div>
            
            <div className="p-6">
              {/* Add Reminder Form */}
              {showAddForm && (
                <form onSubmit={addReminder} className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200 animate-scale-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Title*</label>
                      <input
                        type="text"
                        value={newReminder.title}
                        onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
                        placeholder="e.g., Follow up with company"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-300 focus-ring"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                      <textarea
                        value={newReminder.description}
                        onChange={(e) => setNewReminder({ ...newReminder, description: e.target.value })}
                        placeholder="Additional details..."
                        rows="2"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-300 focus-ring resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                      <input
                        type="date"
                        value={newReminder.dueDate}
                        onChange={(e) => setNewReminder({ ...newReminder, dueDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-300 focus-ring"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                      <select
                        value={newReminder.priority}
                        onChange={(e) => setNewReminder({ ...newReminder, priority: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-300 focus-ring"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 mt-4">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-300 transform hover:scale-105 focus-ring"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-sky-500 border border-transparent rounded-lg hover:bg-sky-600 transition-all duration-300 transform hover:scale-105 btn-shine focus-ring"
                    >
                      Add Reminder
                    </button>
                  </div>
                </form>
              )}
              
              {/* Reminders List */}
              <div className="space-y-4">
                {reminders.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p>No reminders set</p>
                    <p className="text-sm">Click "Add Reminder" to create your first reminder</p>
                  </div>
                ) : (
                  reminders.map((reminder, index) => (
                    <div
                      key={reminder.id}
                      className={`p-4 rounded-xl border transition-all duration-300 transform hover:scale-[1.02] stagger-item ${
                        reminder.completed 
                          ? 'bg-gray-50 border-gray-200 opacity-75' 
                          : 'bg-white border-gray-200 hover:shadow-md'
                      }`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <button
                            onClick={() => toggleReminder(reminder.id)}
                            className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-300 transform hover:scale-110 ${
                              reminder.completed
                                ? 'bg-green-500 border-green-500 text-white'
                                : 'border-gray-300 hover:border-sky-500'
                            }`}
                          >
                            {reminder.completed && (
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </button>
                          <div className="flex-1">
                            <h4 className={`text-sm font-medium ${reminder.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                              {reminder.title}
                            </h4>
                            {reminder.description && (
                              <p className={`text-xs mt-1 ${reminder.completed ? 'text-gray-400' : 'text-gray-600'}`}>
                                {reminder.description}
                              </p>
                            )}
                            <div className="flex items-center space-x-3 mt-2">
                              {reminder.dueDate && (
                                <span className="inline-flex items-center text-xs text-gray-500">
                                  <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  Due: {new Date(reminder.dueDate).toLocaleDateString()}
                                </span>
                              )}
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(reminder.priority)}`}>
                                {reminder.priority}
                              </span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => deleteReminder(reminder.id)}
                          className="ml-4 text-gray-400 hover:text-red-600 transition-all duration-300 transform hover:scale-110 focus-ring rounded"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
