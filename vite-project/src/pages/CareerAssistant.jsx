import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CareerAssistant = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('analyze');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [inputMethod, setInputMethod] = useState('file'); // 'file' or 'text'
  
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
    setInputMethod('file');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl border border-slate-200 max-w-md mx-4">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Authentication Required</h2>
          <p className="text-slate-600 mb-6">Please sign in to access the AI Career Assistant and unlock personalized job analysis features.</p>
          <div className="flex justify-center">
            <button 
              onClick={() => navigate('/auth')}
              className="bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold py-3 px-8 rounded-full hover:from-sky-600 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Enhanced Header */}
      <div className="bg-white/80 backdrop-blur-lg shadow-lg border-b border-slate-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg animate-pulse-glow">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  AI Career Assistant
                </h1>
                <p className="text-sm text-slate-500 font-medium">Powered by Gemini 1.5-Flash</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <div className="flex items-center space-x-2 text-sm text-slate-600">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>AI System Online</span>
              </div>
              <div className="text-sm text-slate-500">
                Smart Resume Analysis & Interview Prep
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Modern Tab Navigation */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-slate-200/50 p-1 rounded-2xl backdrop-blur-sm">
            {[
              { id: 'analyze', label: 'Smart Analysis', icon: '🧠' },
              { id: 'tips', label: 'Interview Prep', icon: '💡' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-white text-slate-900 shadow-lg shadow-slate-200/50 transform scale-105'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Analysis Tab */}
        {activeTab === 'analyze' && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Enhanced Input Section */}
            <div className="xl:col-span-1 space-y-6">
              <div className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-xl border border-slate-200/50 overflow-hidden">
                <div className="p-8">
                  <div className="flex items-center space-x-3 mb-8">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">Resume Input</h2>
                      <p className="text-sm text-slate-600">Upload or paste your resume</p>
                    </div>
                  </div>
                  
                  {/* Input Method Toggle */}
                  <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl mb-6">
                    {[
                      { id: 'file', label: 'Upload File', icon: '📄' },
                      { id: 'text', label: 'Paste Text', icon: '✏️' }
                    ].map((method) => (
                      <button
                        key={method.id}
                        onClick={() => setInputMethod(method.id)}
                        className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-lg font-medium text-sm transition-all duration-300 ${
                          inputMethod === method.id
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <span>{method.icon}</span>
                        <span>{method.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* File Upload */}
                  {inputMethod === 'file' && (
                    <div className="space-y-4">
                      <div className="relative">
                        <input
                          type="file"
                          id="resume-upload"
                          accept=".txt,.pdf,.png,.jpg,.jpeg,.bmp,.tiff,.webp,.doc,.docx"
                          onChange={(e) => setResumeFile(e.target.files[0])}
                          className="hidden"
                        />
                        <label
                          htmlFor="resume-upload"
                          className={`block w-full p-6 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 ${
                            resumeFile 
                              ? 'border-green-300 bg-green-50' 
                              : 'border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50'
                          }`}
                        >
                          <div className="text-center">
                            {resumeFile ? (
                              <>
                                <svg className="mx-auto h-12 w-12 text-green-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-green-700 font-semibold">{resumeFile.name}</p>
                                <p className="text-green-600 text-sm mt-1">
                                  {resumeFile.type || 'Unknown type'} • {(resumeFile.size / 1024).toFixed(1)} KB
                                </p>
                              </>
                            ) : (
                              <>
                                <svg className="mx-auto h-12 w-12 text-slate-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                <p className="text-slate-700 font-semibold">Click to upload resume</p>
                                <p className="text-slate-500 text-sm mt-1">
                                  PDF, Images, Word docs, or Text files
                                </p>
                              </>
                            )}
                          </div>
                        </label>
                      </div>
                      
                      {resumeFile && (
                        <button
                          onClick={() => setResumeFile(null)}
                          className="w-full py-2 px-4 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-all duration-300 text-sm font-medium"
                        >
                          Remove File
                        </button>
                      )}
                    </div>
                  )}

                  {/* Text Input */}
                  {inputMethod === 'text' && (
                    <div>
                      <textarea
                        value={resumeText}
                        onChange={(e) => setResumeText(e.target.value)}
                        placeholder="Paste your resume content here..."
                        rows={8}
                        className="w-full px-4 py-3 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 resize-none bg-white/80 backdrop-blur-sm"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Job Description Input */}
              <div className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-xl border border-slate-200/50 overflow-hidden">
                <div className="p-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V4a2 2 0 00-2-2H6a2 2 0 00-2 2v2m8 0h4a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2h4m8 0V6a2 2 0 00-2-2V4" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">Job Description</h2>
                      <p className="text-sm text-slate-600">Target position details</p>
                    </div>
                  </div>
                  
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the job description here..."
                    rows={8}
                    className="w-full px-4 py-3 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 resize-none bg-white/80 backdrop-blur-sm"
                    required
                  />
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={inputMethod === 'file' ? analyzeResumeFile : analyzeJobFit}
                disabled={loading || (inputMethod === 'text' ? !resumeText.trim() : !resumeFile) || !jobDescription.trim()}
                className="w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 text-white font-bold py-4 px-8 rounded-2xl hover:from-blue-600 hover:via-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-xl disabled:transform-none relative overflow-hidden"
              >
                <div className="relative z-10 flex items-center justify-center">
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Analyzing with AI...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span>Analyze Job Fit</span>
                    </>
                  )}
                </div>
                {!loading && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                )}
              </button>

              {/* Error Display */}
              {error && (
                <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-2xl p-4">
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-red-700 font-medium">{error}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced Results Section */}
            <div className="xl:col-span-2">
              <div className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-xl border border-slate-200/50 min-h-[600px]">
                {results ? (
                  <div className="p-8">
                    {/* Results Header */}
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-slate-900">Analysis Complete</h2>
                          <p className="text-slate-600">AI-powered job fit analysis</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-4xl font-black bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                          {Math.round(results.match_score)}%
                        </div>
                        <p className="text-sm text-slate-500 font-semibold">Match Score</p>
                      </div>
                    </div>

                    {/* Enhanced Match Score Visualization */}
                    <div className="mb-8">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-lg font-semibold text-slate-800">Job Fit Score</span>
                        <span className="text-sm text-slate-600 font-medium">{Math.round(results.match_score)}% Match</span>
                      </div>
                      <div className="relative">
                        <div className="w-full bg-slate-200 rounded-full h-4 shadow-inner">
                          <div 
                            className="h-4 rounded-full transition-all duration-2000 ease-out relative overflow-hidden"
                            style={{ 
                              width: `${results.match_score}%`,
                              background: `linear-gradient(90deg, 
                                ${results.match_score >= 80 ? '#10B981, #059669' : 
                                  results.match_score >= 60 ? '#F59E0B, #D97706' : 
                                  '#EF4444, #DC2626'})`
                            }}
                          >
                            <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                          </div>
                        </div>
                        <div className="flex justify-between text-xs text-slate-500 mt-1">
                          <span>0%</span>
                          <span>50%</span>
                          <span>100%</span>
                        </div>
                      </div>
                    </div>

                    {/* Modern Keywords Analysis */}
                    <div className="mb-8">
                      <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                        <svg className="w-6 h-6 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        Keyword Analysis
                      </h3>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Matched Keywords */}
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                          <h4 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-2">
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                            Matched Skills ({results.matched_keywords.length})
                          </h4>
                          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                            {results.matched_keywords.map((keyword, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-500 text-white shadow-sm hover:bg-green-600 transition-colors duration-200"
                              >
                                {keyword}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Missing Keywords */}
                        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-200">
                          <h4 className="text-lg font-semibold text-orange-800 mb-4 flex items-center">
                            <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center mr-2">
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                              </svg>
                            </div>
                            Missing Skills ({results.missing_keywords.length})
                          </h4>
                          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                            {results.missing_keywords.map((keyword, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-orange-500 text-white shadow-sm hover:bg-orange-600 transition-colors duration-200"
                              >
                                {keyword}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Analysis Summary */}
                    <div className="mb-8">
                      <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                        <svg className="w-6 h-6 mr-2 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        AI Summary
                      </h3>
                      <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-6 border border-slate-200">
                        <p className="text-slate-700 leading-relaxed">{results.analysis_summary}</p>
                      </div>
                    </div>

                    {/* Interview Questions */}
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                        <svg className="w-6 h-6 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Interview Preparation
                      </h3>
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {results.interview_questions.map((qa, index) => (
                          <div key={index} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300">
                            <div className="flex items-start space-x-4">
                              <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                {index + 1}
                              </div>
                              <div className="flex-1">
                                <h4 className="text-lg font-semibold text-slate-900 mb-3">
                                  {qa.question}
                                </h4>
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border-l-4 border-blue-500">
                                  <p className="text-slate-700 leading-relaxed">
                                    {qa.sample_answer}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-8 flex justify-center">
                      <button
                        onClick={clearResults}
                        className="px-8 py-3 bg-gradient-to-r from-slate-600 to-slate-700 text-white font-semibold rounded-2xl hover:from-slate-700 hover:to-slate-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
                      >
                        Start New Analysis
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full p-8">
                    <div className="text-center">
                      <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <svg className="w-12 h-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-slate-900 mb-2">Ready for Analysis</h3>
                      <p className="text-slate-600 mb-4">Upload your resume and job description to get AI-powered insights</p>
                      <div className="flex items-center justify-center space-x-6 text-sm text-slate-500">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <span>Match Score</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                          <span>Keywords Analysis</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                          <span>Interview Prep</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Interview Tips Tab */}
        {activeTab === 'tips' && (
          <div className="space-y-8">
            {/* Tips Header */}
            <div className="text-center">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-4">
                Interview Preparation Guide
              </h2>
              <p className="text-slate-600 text-lg max-w-2xl mx-auto">
                Master your next interview with our comprehensive preparation framework
              </p>
            </div>

            {/* Tips Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: "Company Research",
                  description: "Deep dive into company culture, recent news, mission, and values to show genuine interest",
                  icon: "🔍",
                  color: "from-blue-500 to-cyan-500",
                  tips: ["Check recent news & press releases", "Review company social media", "Research key executives", "Understand company mission"]
                },
                {
                  title: "Technical Preparation",
                  description: "Review relevant technologies, coding concepts, and practice problem-solving scenarios",
                  icon: "💻",
                  color: "from-green-500 to-emerald-500",
                  tips: ["Practice coding problems", "Review system design", "Study relevant frameworks", "Prepare technical examples"]
                },
                {
                  title: "Behavioral Questions",
                  description: "Master the STAR method and prepare compelling stories from your experience",
                  icon: "💬",
                  color: "from-purple-500 to-pink-500",
                  tips: ["Use STAR method", "Prepare 5-7 key stories", "Practice out loud", "Focus on achievements"]
                },
                {
                  title: "Smart Questions",
                  description: "Prepare thoughtful questions that demonstrate your interest and strategic thinking",
                  icon: "❓",
                  color: "from-orange-500 to-red-500",
                  tips: ["Ask about team dynamics", "Inquire about growth opportunities", "Discuss challenges", "Learn about company goals"]
                },
                {
                  title: "Mock Interviews",
                  description: "Practice with friends, mentors, or online platforms to build confidence",
                  icon: "🎭",
                  color: "from-indigo-500 to-purple-500",
                  tips: ["Record yourself practicing", "Get feedback from others", "Time your responses", "Practice different scenarios"]
                },
                {
                  title: "Portfolio Review",
                  description: "Prepare to discuss your projects, decisions, and technical approaches in detail",
                  icon: "📁",
                  color: "from-teal-500 to-blue-500",
                  tips: ["Prepare project deep-dives", "Explain technical decisions", "Discuss challenges faced", "Highlight impact & results"]
                }
              ].map((tip, index) => (
                <div 
                  key={index} 
                  className="group bg-white/70 backdrop-blur-lg rounded-3xl shadow-xl border border-slate-200/50 overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="p-8">
                    {/* Icon and Title */}
                    <div className="flex items-center space-x-4 mb-6">
                      <div className={`w-14 h-14 bg-gradient-to-r ${tip.color} rounded-2xl flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        {tip.icon}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">{tip.title}</h3>
                      </div>
                    </div>
                    
                    {/* Description */}
                    <p className="text-slate-600 mb-6 leading-relaxed">{tip.description}</p>
                    
                    {/* Action Items */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-slate-800 mb-3">Key Actions:</h4>
                      {tip.tips.map((item, tipIndex) => (
                        <div key={tipIndex} className="flex items-center space-x-2 text-sm text-slate-600">
                          <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
                          <span>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Hover Effect Gradient */}
                  <div className={`h-1 bg-gradient-to-r ${tip.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`}></div>
                </div>
              ))}
            </div>

            {/* Additional Resources */}
            <div className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-xl border border-slate-200/50 p-8">
              <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                <svg className="w-8 h-8 mr-3 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Pro Interview Tips
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-lg font-semibold text-slate-800 mb-4">Before the Interview</h4>
                  <ul className="space-y-3 text-slate-600">
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <span>Test your tech setup 30 minutes early for virtual interviews</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <span>Prepare your environment - clean background, good lighting</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <span>Have copies of your resume and a notepad ready</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                      <span>Plan your route and arrive 10-15 minutes early</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold text-slate-800 mb-4">During the Interview</h4>
                  <ul className="space-y-3 text-slate-600">
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <span>Maintain eye contact and show enthusiasm</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <span>Listen actively and ask for clarification when needed</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <span>Use specific examples and quantify your achievements</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <span>Take notes and reference them in your follow-up</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CareerAssistant;
