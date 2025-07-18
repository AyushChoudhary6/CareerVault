import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-blue-100 page-container">
      {/* Hero Section */}
      <section className="pt-20 pb-32 relative overflow-hidden animate-fade-in">
        {/* Animated background with modern gradient */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -inset-10 opacity-30">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-sky-300 to-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
            <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-300 to-sky-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-gradient-to-r from-sky-400 to-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
          </div>
          
          {/* Professional floating elements */}
          <div className="absolute inset-0">
            {[...Array(15)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-float-slow opacity-20"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${4 + Math.random() * 3}s`
                }}
              >
                <div className="w-2 h-2 bg-sky-400 rounded-full"></div>
              </div>
            ))}
          </div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-16 max-w-7xl mx-auto">
            <div className="lg:w-1/2 mb-16 lg:mb-0 text-center lg:text-left animate-slide-in-left">
              <div className="relative">
                {/* Professional glowing effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-sky-400/20 to-blue-500/20 rounded-3xl blur-xl scale-110"></div>
                
                <div className="relative bg-white/90 backdrop-blur-lg p-12 rounded-3xl shadow-2xl border border-white/50 smooth-hover">
                  <div className="mb-8">
                    <span className="inline-block px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white text-sm font-semibold rounded-full mb-8 shadow-lg animate-bounce-soft">
                      ✨ Professional Job Tracking Made Simple
                    </span>
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-6 tracking-tight leading-tight animate-fade-in animation-delay-300">
                      <span className="bg-gradient-to-r from-gray-900 via-sky-700 to-blue-800 bg-clip-text text-transparent">
                        JobTracker
                      </span>
                      <br />
                      <span className="bg-gradient-to-r from-sky-500 via-blue-600 to-sky-700 bg-clip-text text-transparent">
                        Pro
                      </span>
                    </h1>
                  </div>
                  
                  <p className="text-xl md:text-2xl text-gray-700 mb-10 max-w-md mx-auto lg:mx-0 font-medium leading-relaxed">
                    Transform your job search with intelligent tracking, beautiful analytics, and professional insights.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in animation-delay-700">
                    <Link
                      to="/auth"
                      className="group bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold py-4 px-8 rounded-full hover:from-sky-600 hover:to-blue-700 shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center relative overflow-hidden btn-shine transform hover:scale-105 focus-ring"
                    >
                      <span className="relative flex items-center">
                        Get Started
                        <svg className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                        </svg>
                      </span>
                    </Link>
                    
                    <Link
                      to="/jobs"
                      className="group bg-white/90 backdrop-blur-sm text-sky-700 font-semibold py-4 px-8 rounded-full border-2 border-sky-200 hover:bg-sky-50 hover:border-sky-300 hover:shadow-xl transition-all duration-300 flex items-center justify-center transform hover:scale-105 focus-ring"
                    >
                      View Demo
                      <svg className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:w-1/2 animate-slide-in-right animation-delay-500">
              <div className="relative">
                {/* Professional decorative elements */}
                <div className="absolute -top-6 -left-6 w-20 h-20 bg-gradient-to-br from-sky-400 to-blue-500 rounded-2xl rotate-12 shadow-lg opacity-80"></div>
                <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-gradient-to-br from-blue-500 to-sky-600 rounded-2xl -rotate-12 shadow-lg opacity-80"></div>
                <div className="absolute top-1/2 -right-3 w-6 h-6 bg-gradient-to-br from-sky-400 to-blue-500 rounded-full animate-float" style={{animationDelay: '1.5s'}}></div>
                <div className="absolute bottom-1/3 -left-3 w-6 h-6 bg-gradient-to-br from-blue-400 to-sky-500 rounded-full animate-float" style={{animationDelay: '2s'}}></div>
                
                {/* Modern dashboard mockup */}
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/30 transform hover:scale-[1.02] transition-transform duration-500 bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-lg">
                  <div className="absolute inset-0 bg-gradient-to-tr from-sky-500/5 to-transparent z-10"></div>
                  
                  {/* Dashboard UI Mockup */}
                  <div className="p-8 bg-gradient-to-br from-white to-sky-50/50">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-sky-500 to-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-lg">J</span>
                        </div>
                        <span className="font-bold text-sky-700 text-lg">JobTrackerPro</span>
                      </div>
                      <div className="w-10 h-10 bg-gradient-to-r from-sky-100 to-blue-100 rounded-full flex items-center justify-center">
                        <div className="w-6 h-6 bg-sky-400 rounded-full"></div>
                      </div>
                    </div>
                    
                    {/* Stats cards */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="bg-white rounded-2xl p-6 shadow-sm border border-sky-100">
                        <div className="text-3xl font-bold text-sky-600">24</div>
                        <div className="text-sm text-gray-600 font-medium">Applications</div>
                      </div>
                      <div className="bg-white rounded-2xl p-6 shadow-sm border border-sky-100">
                        <div className="text-3xl font-bold text-blue-600">8</div>
                        <div className="text-sm text-gray-600 font-medium">Interviews</div>
                      </div>
                    </div>
                    
                    {/* Chart area */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-sky-100">
                      <div className="h-32 bg-gradient-to-r from-sky-50 to-blue-50 rounded-xl flex items-end justify-around p-4">
                        <div className="w-8 bg-sky-500 rounded-t-lg" style={{height: '60%'}}></div>
                        <div className="w-8 bg-blue-500 rounded-t-lg" style={{height: '80%'}}></div>
                        <div className="w-8 bg-sky-400 rounded-t-lg" style={{height: '40%'}}></div>
                        <div className="w-8 bg-blue-600 rounded-t-lg" style={{height: '90%'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white relative overflow-hidden">
        {/* Professional background patterns */}
        <div className="absolute inset-0 opacity-3">
          <div className="absolute top-0 left-0 w-full h-full" style={{backgroundImage: 'radial-gradient(circle at 50% 50%, #0ea5e9 1px, transparent 1px)', backgroundSize: '30px 30px'}}></div>
        </div>
        
        {/* Subtle floating background elements */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-sky-100/50 to-blue-100/50 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 left-20 w-48 h-48 bg-gradient-to-br from-blue-100/30 to-sky-100/30 rounded-full blur-xl"></div>
        
        <div className="container mx-auto px-6 relative">
          <div className="text-center mb-20">
            <span className="inline-block px-6 py-3 bg-sky-100 text-sky-700 rounded-full text-sm font-semibold mb-6 shadow-sm">Features</span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Everything You Need for Professional Job Tracking</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">Our comprehensive suite of tools helps you stay organized, focused, and significantly increases your chances of landing that dream job.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white p-10 rounded-3xl shadow-lg border border-sky-100/50 hover:shadow-xl hover:translate-y-[-4px] transition-all duration-300 flex flex-col items-center text-center group">
              <div className="bg-gradient-to-r from-sky-100 to-blue-100 p-6 rounded-2xl mb-8 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-12 h-12 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Smart Application Tracking</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                Organize all your job applications in one centralized dashboard with intelligent status tracking and detailed progress monitoring.
              </p>
            </div>
            
            <div className="bg-white p-10 rounded-3xl shadow-lg border border-sky-100/50 hover:shadow-xl hover:translate-y-[-4px] transition-all duration-300 flex flex-col items-center text-center group">
              <div className="bg-gradient-to-r from-blue-100 to-sky-100 p-6 rounded-2xl mb-8 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Advanced Analytics</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                Gain valuable insights with beautiful, interactive charts and analytics that help you optimize your job search strategy.
              </p>
            </div>
            
            <div className="bg-white p-10 rounded-3xl shadow-lg border border-sky-100/50 hover:shadow-xl hover:translate-y-[-4px] transition-all duration-300 flex flex-col items-center text-center group">
              <div className="bg-gradient-to-r from-sky-100 to-blue-100 p-6 rounded-2xl mb-8 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-12 h-12 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-5 5v-5zM4 12h16m-7 6h7m-7-6h7m-7-6h7M4 6h16"></path>
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Professional Timeline</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                Never miss important deadlines with smart reminders and timeline tracking for interviews, follow-ups, and applications.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-24 bg-gradient-to-br from-sky-600 via-blue-700 to-sky-800 relative overflow-hidden">
        {/* Professional animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-sky-400/20 to-blue-400/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-blue-400/20 to-sky-400/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-sky-300/10 to-blue-300/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-lg p-16 rounded-3xl shadow-2xl border border-white/20">
            <div className="text-center">
              <span className="inline-block px-8 py-3 bg-gradient-to-r from-sky-400 to-blue-500 text-white rounded-full text-sm font-bold mb-8 shadow-lg">
                🚀 Ready to Get Started?
              </span>
              <h2 className="text-4xl md:text-5xl font-bold mb-8 text-white">
                Transform Your Job Search Today
              </h2>
              <p className="text-xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed">
                Join thousands of professionals who have streamlined their job search process and achieved better results with JobTrackerPro.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link
                  to="/dashboard"
                  className="group bg-white text-sky-700 font-bold py-5 px-12 rounded-full hover:bg-sky-50 shadow-xl hover:shadow-2xl hover:translate-y-[-2px] transition-all duration-300 flex items-center justify-center relative overflow-hidden"
                >
                  <span className="relative flex items-center">
                    Start Tracking Now
                    <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                    </svg>
                  </span>
                </Link>
                <Link
                  to="/jobs"
                  className="group bg-white/10 backdrop-blur-sm text-white font-bold py-5 px-12 rounded-full border-2 border-white/30 hover:bg-white/20 hover:border-white/50 hover:shadow-xl hover:translate-y-[-2px] transition-all duration-300 flex items-center justify-center"
                >
                  View Demo
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Modern Footer */}
      <footer className="py-16 bg-gray-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-sky-900/20 to-blue-900/20"></div>
        <div className="container mx-auto px-6 relative">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <div className="mb-8 md:mb-0">
              <span className="text-3xl font-bold bg-gradient-to-r from-sky-400 to-blue-400 bg-clip-text text-transparent">
                JobTrackerPro
              </span>
              <p className="mt-3 text-gray-300 text-lg">Your professional job search companion</p>
            </div>
            
            <div className="flex space-x-8">
              <a href="#" className="text-gray-400 hover:text-sky-400 transition-colors duration-300 transform hover:scale-110">
                <span className="sr-only">Twitter</span>
                <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors duration-300 transform hover:scale-110">
                <span className="sr-only">GitHub</span>
                <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-sky-400 transition-colors duration-300 transform hover:scale-110">
                <span className="sr-only">LinkedIn</span>
                <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
          </div>
          
          <div className="border-t border-gray-700 pt-8 text-center">
            <p className="text-gray-400 text-lg">
              © {new Date().getFullYear()} JobTrackerPro. All rights reserved. Built with ❤️ for professional job seekers.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
