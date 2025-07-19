import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const CareerAssistant = () => {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('analyze');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  
  // Form states
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  
  const [error, setError] = useState('');

  const analyzeJobFit = async () => {
    if (!resumeText.trim() || !jobDescription.trim()) {
      setError('Please provide both resume text and job description');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:8000/api/ai/analyze-job-fit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          resume_text: resumeText,
          job_description: jobDescription
        })
      });

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.status}`);
      }

      const data = await response.json();
      setResults(data);
    } catch (error) {
      setError(error.message);
      console.error('Analysis error:', error);
    } finally {
      setLoading(false);
    }
  };

  const analyzeResumeFile = async () => {
    if (!resumeFile || !jobDescription.trim()) {
      setError('Please provide both resume file and job description');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('authToken');
      const formData = new FormData();
      formData.append('resume_file', resumeFile);
      formData.append('job_description', jobDescription);

      const response = await fetch('http://localhost:8000/api/ai/test-analyze-resume-file', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`File analysis failed: ${response.status}`);
      }

      const data = await response.json();
      setResults(data.analysis);
    } catch (error) {
      setError(error.message);
      console.error('File analysis error:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResults(null);
    setError('');
    setResumeText('');
    setJobDescription('');
    setResumeFile(null);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h2>
          <p className="text-gray-600">You need to be signed in to use the AI Career Assistant</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 page-container">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 animate-slide-in-left">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center animate-bounce-soft">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h1 className="text-2xl font-semibold text-gray-900 animate-fade-in animation-delay-200">AI Career Assistant</h1>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500 animate-fade-in animation-delay-300">
              <span>•</span>
              <span>Powered by Gemini AI</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-8 animate-scale-in animation-delay-500">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('analyze')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-all duration-300 ${
                  activeTab === 'analyze'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Resume Analysis
              </button>
              <button
                onClick={() => setActiveTab('tips')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-all duration-300 ${
                  activeTab === 'tips'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Interview Tips
              </button>
            </nav>
          </div>
        </div>

        {/* Analysis Tab */}
        {activeTab === 'analyze' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
            {/* Input Section */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 smooth-hover">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Job Fit Analysis</h2>
                
                {/* Resume Input Options */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Resume Input</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-2">Upload Resume File</label>
                      <input
                        type="file"
                        accept=".txt,.pdf,.png,.jpg,.jpeg,.bmp,.tiff,.webp,.doc,.docx"
                        onChange={(e) => setResumeFile(e.target.files[0])}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 focus-ring text-sm"
                      />
                      <div className="mt-2">
                        <p className="text-xs text-gray-400">Supports: PDF, Images (PNG, JPG, JPEG), Word docs (DOC, DOCX), and Text files</p>
                        {resumeFile && (
                          <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="text-xs text-green-700 font-medium">
                                File selected: {resumeFile.name}
                              </span>
                            </div>
                            <p className="text-xs text-green-600 mt-1">
                              Type: {resumeFile.type || 'Unknown'} • Size: {(resumeFile.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-center">
                      <span className="text-gray-400 text-sm">OR</span>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-xs text-gray-500 mb-2">Paste Resume Text</label>
                    <textarea
                      value={resumeText}
                      onChange={(e) => setResumeText(e.target.value)}
                      placeholder="Paste your resume content here..."
                      rows={8}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 focus-ring resize-none"
                    />
                  </div>
                </div>

                {/* Job Description Input */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Job Description*</label>
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the job description here..."
                    rows={8}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 focus-ring resize-none"
                    required
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4">
                  <button
                    onClick={resumeFile ? analyzeResumeFile : analyzeJobFit}
                    disabled={loading || (!resumeText.trim() && !resumeFile) || !jobDescription.trim()}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 btn-shine focus-ring"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Analyzing...
                      </div>
                    ) : (
                      'Analyze Job Fit'
                    )}
                  </button>
                  
                  {results && (
                    <button
                      onClick={clearResults}
                      className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-all duration-300 transform hover:scale-105 focus-ring"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Error Display */}
                {error && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg animate-scale-in">
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Results Section */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
              {results ? (
                <div className="p-6 animate-fade-in">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Analysis Results</h2>
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-blue-600">{Math.round(results.match_score)}%</span>
                      <span className="text-sm text-gray-500">Match</span>
                    </div>
                  </div>

                  {/* Match Score Indicator */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Job Fit Score</span>
                      <span className="text-sm text-gray-500">{Math.round(results.match_score)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${results.match_score}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Keywords Analysis */}
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Keyword Analysis</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Matched Keywords */}
                      <div>
                        <h4 className="text-sm font-medium text-green-700 mb-2 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Matched ({results.matched_keywords.length})
                        </h4>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {results.matched_keywords.map((keyword, index) => (
                            <span
                              key={index}
                              className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mr-1 mb-1"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Missing Keywords */}
                      <div>
                        <h4 className="text-sm font-medium text-red-700 mb-2 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          Missing ({results.missing_keywords.length})
                        </h4>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {results.missing_keywords.map((keyword, index) => (
                            <span
                              key={index}
                              className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full mr-1 mb-1"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Analysis Summary */}
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Summary</h3>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{results.analysis_summary}</p>
                  </div>

                  {/* Interview Questions */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Interview Questions & Answers</h3>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {results.interview_questions.map((qa, index) => (
                        <div key={index} className="bg-gray-50 p-4 rounded-lg stagger-item" style={{ animationDelay: `${index * 100}ms` }}>
                          <h4 className="text-sm font-medium text-gray-900 mb-2">
                            Q{index + 1}: {qa.question}
                          </h4>
                          <p className="text-sm text-gray-700 bg-white p-3 rounded border-l-4 border-blue-500">
                            {qa.sample_answer}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center text-gray-500">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <p>Analysis results will appear here</p>
                  <p className="text-sm mt-1">Upload your resume and job description to get started</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Interview Tips Tab */}
        {activeTab === 'tips' && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 animate-fade-in">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Interview Preparation Tips</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: "Research the Company",
                  description: "Learn about company culture, recent news, and mission",
                  icon: "🔍"
                },
                {
                  title: "Technical Preparation",
                  description: "Review relevant technologies and coding concepts",
                  icon: "💻"
                },
                {
                  title: "Practice Behavioral Questions",
                  description: "Use STAR method for structured responses",
                  icon: "💬"
                },
                {
                  title: "Prepare Questions",
                  description: "Have thoughtful questions about the role and team",
                  icon: "❓"
                },
                {
                  title: "Mock Interviews",
                  description: "Practice with friends or online platforms",
                  icon: "🎭"
                },
                {
                  title: "Portfolio Review",
                  description: "Be ready to discuss your projects in detail",
                  icon: "📁"
                }
              ].map((tip, index) => (
                <div 
                  key={index} 
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-all duration-300 transform hover:scale-105 stagger-item"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="text-2xl mb-2">{tip.icon}</div>
                  <h3 className="font-medium text-gray-900 mb-2">{tip.title}</h3>
                  <p className="text-sm text-gray-600">{tip.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CareerAssistant;
