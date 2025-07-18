import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center py-3">
          <Link to="/" className="flex items-center space-x-2">
            <div className="h-10 w-10 bg-sky-500 text-white flex items-center justify-center rounded-full font-bold text-xl shadow-sm">J</div>
            <span className="text-xl font-extrabold text-sky-600">JobTrackerPro</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <NavLink 
              to="/" 
              className={({isActive}) => `px-4 py-2 rounded-full text-gray-600 hover:text-sky-600 hover:bg-sky-50 transition-colors font-medium ${isActive ? 'text-sky-600 bg-sky-50' : ''}`}
              end
            >
              Home
            </NavLink>
            <NavLink 
              to="/dashboard" 
              className={({isActive}) => `px-4 py-2 rounded-full text-gray-600 hover:text-sky-600 hover:bg-sky-50 transition-colors font-medium ${isActive ? 'text-sky-600 bg-sky-50' : ''}`}
            >
              Dashboard
            </NavLink>
           
            
            <div className="border-l border-gray-200 h-6 mx-4"></div>
            
            {user ? (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/profile" 
                  className="flex items-center text-gray-600 hover:text-sky-600 transition-colors px-3 py-2 rounded-full hover:bg-sky-50"
                >
                  <span className="h-9 w-9 rounded-full bg-gradient-to-r from-sky-500 to-sky-600 text-white flex items-center justify-center mr-2 shadow-sm font-medium">
                    {user.username?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                  <span className="font-medium">{user.username}</span>
                </Link>
                <button
                  onClick={logout}
                  className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-2 rounded-full text-sm font-medium transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate('/auth')}
                className="bg-sky-500 text-white hover:bg-sky-600 px-6 py-2.5 rounded-full text-sm font-medium transition-colors shadow-sm hover:shadow-md"
              >
                Sign In
              </button>
            )}
          </div>
          
          {/* Mobile menu button */}
          <button 
            className="md:hidden text-gray-600 focus:outline-none p-2 rounded-full hover:bg-gray-100"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
        
        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 bg-white shadow-lg rounded-b-2xl">
            <NavLink 
              to="/" 
              className={({isActive}) => `block py-3 px-4 rounded-full mx-2 ${isActive ? 'text-sky-600 bg-sky-50' : 'text-gray-600'}`}
              end
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </NavLink>
            <NavLink 
              to="/dashboard" 
              className={({isActive}) => `block py-3 px-4 rounded-full mx-2 ${isActive ? 'text-sky-600 bg-sky-50' : 'text-gray-600'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </NavLink>
            <NavLink 
              to="/jobs" 
              className={({isActive}) => `block py-3 px-4 rounded-full mx-2 ${isActive ? 'text-sky-600 bg-sky-50' : 'text-gray-600'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Jobs
            </NavLink>
            <NavLink 
              to="/analytics" 
              className={({isActive}) => `block py-3 px-4 rounded-full mx-2 ${isActive ? 'text-sky-600 bg-sky-50' : 'text-gray-600'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Analytics
            </NavLink>
            <NavLink 
              to="/profile" 
              className={({isActive}) => `block py-3 px-4 rounded-full mx-2 ${isActive ? 'text-sky-600 bg-sky-50' : 'text-gray-600'}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Profile
            </NavLink>
            
            <div className="border-t border-gray-100 my-2"></div>
            
            {user ? (
              <button
                onClick={() => { logout(); setMobileMenuOpen(false); }}
                className="w-full text-left text-gray-600 mt-2 py-3 px-4 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            ) : (
              <button
                onClick={() => { navigate('/auth'); setMobileMenuOpen(false); }}
                className="w-full text-left bg-sky-500 text-white mt-2 py-3 px-4 rounded-full transition-colors mx-2"
              >
                Sign In
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
