import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const navItems = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/jobs', label: 'Job Listings', icon: '📝' },
    { path: '/add-job', label: 'Add Job', icon: '➕' },
    { path: '/analytics', label: 'Analytics', icon: '📈' },
    { path: '/profile', label: 'Profile', icon: '👤' },
  ];

  // Group nav items by category
  const mainNavItems = navItems.slice(0, 4);
  const secondaryNavItems = navItems.slice(4);

  return (
    <div className={`h-screen bg-gray-900 text-white transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'} border-r border-gray-800 shadow-xl`}>
      <div className="p-4 flex justify-between items-center border-b border-gray-800">
        {!collapsed && (
          <div className="flex items-center">
            <div className="h-8 w-8 bg-blue-500 rounded-md flex items-center justify-center text-white font-bold mr-2 shadow-inner">J</div>
            <h2 className="text-xl font-bold text-blue-400">JobTracker</h2>
          </div>
        )}
        {collapsed && (
          <div className="mx-auto">
            <div className="h-8 w-8 bg-blue-500 rounded-md flex items-center justify-center text-white font-bold shadow-inner">J</div>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded text-gray-400 hover:bg-gray-800 hover:text-white transition"
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>
      
      <div className="py-6 px-4">
        {!collapsed && (
          <div className="mb-6">
            <h3 className="text-xs uppercase text-gray-500 font-semibold tracking-wider mb-3">Main Navigation</h3>
          </div>
        )}
        <nav>
          <ul className="space-y-1">
            {mainNavItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) => 
                    `flex items-center py-3 px-4 rounded-lg transition-all duration-200 ${
                      isActive 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className={`flex items-center justify-center text-xl w-8 h-8 ${!collapsed ? 'mr-3' : ''} ${isActive ? 'text-white' : 'text-gray-400'}`}>
                        {item.icon}
                      </div>
                      {!collapsed && <span className="font-medium">{item.label}</span>}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        
        {!collapsed && (
          <div className="my-6">
            <h3 className="text-xs uppercase text-gray-500 font-semibold tracking-wider mb-3">Account</h3>
          </div>
        )}
        
        <nav>
          <ul className="space-y-1">
            {secondaryNavItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) => 
                    `flex items-center py-3 px-4 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span className={`text-xl ${!collapsed ? 'mr-3' : ''} ${isActive ? 'text-white' : 'text-gray-400'}`}>{item.icon}</span>
                      {!collapsed && <span className="font-medium">{item.label}</span>}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        
        {!collapsed && (
          <div className="mt-auto pt-8 px-4">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-5 shadow-inner border border-gray-700">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-blue-500 bg-opacity-20 rounded-full flex items-center justify-center mr-2">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <h4 className="font-medium text-blue-400">Need help?</h4>
              </div>
              <p className="text-sm text-gray-400 mb-3">
                Check our documentation for tips on effective job tracking.
              </p>
              <a 
                href="#" 
                className="text-xs bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded inline-block transition"
              >
                View Docs
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
