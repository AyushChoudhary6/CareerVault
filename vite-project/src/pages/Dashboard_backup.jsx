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
    <div className="min-h-screen relative overflow-hidden">
      {/* Professional Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-100/30"></div>
      
      {/* Subtle Background Elements */}
      <div className="absolute inset-0 overflow-hidden opacity-40">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-indigo-300 to-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-purple-300 to-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float animation-delay-400"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 glass-card border-0 border-b border-slate-200/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-800">Career Dashboard</h1>
                  <p className="text-sm text-slate-600">Track your journey to success</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                to="/career-assistant" 
                className="inline-flex items-center px-6 py-3 bg-white/80 backdrop-blur-lg text-slate-700 font-semibold rounded-2xl border border-slate-200 shadow-lg hover:bg-white hover:shadow-xl transition-all duration-300 transform hover:scale-105 group"
              >
                <svg className="h-5 w-5 mr-2 transition-transform duration-300 group-hover:rotate-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                AI Assistant
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              title: "Total Applications",
              value: stats.totalJobs,
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              ),
              gradient: "from-indigo-500 to-blue-600",
              bg: "from-indigo-50 to-blue-50"
            },
            {
              title: "Interviews",
              value: stats.totalInterviews,
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              ),
              gradient: "from-purple-500 to-indigo-600",
              bg: "from-purple-50 to-indigo-50"
            },
            {
              title: "Offers",
              value: stats.totalOffers,
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              ),
              gradient: "from-emerald-500 to-green-600",
              bg: "from-emerald-50 to-green-50"
            },
            {
              title: "Success Rate",
              value: `${successRate}%`,
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              ),
              gradient: "from-blue-500 to-cyan-600",
              bg: "from-blue-50 to-cyan-50"
            }
          ].map((stat, index) => (
            <div 
              key={index}
              className="glass-card p-6 rounded-3xl hover-lift group animate-scale-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-r ${stat.gradient} rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {stat.icon}
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-slate-800">{stat.value}</p>
                </div>
              </div>
              <h3 className="text-sm font-semibold text-slate-600">{stat.title}</h3>
              <div className={`mt-3 h-2 bg-gradient-to-r ${stat.bg} rounded-full overflow-hidden`}>
                <div className={`h-full bg-gradient-to-r ${stat.gradient} rounded-full transition-all duration-1000 animate-pulse`} style={{width: '70%'}}></div>
              </div>
            </div>
          ))}
        </div>
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
