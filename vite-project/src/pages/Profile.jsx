import React from 'react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, login, logout } = useAuth();

  const handleLogin = () => {
    // For demo purposes, just use dummy data
    login({ email: 'user@example.com', password: 'password' });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>
      
      <div className="bg-white rounded shadow p-6">
        {user ? (
          <>
            <div className="flex items-center mb-6">
              <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-600">
                {user.name.charAt(0)}
              </div>
              <div className="ml-4">
                <h2 className="text-xl font-bold">{user.name}</h2>
                <p className="text-gray-600">{user.email}</p>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="font-medium mb-2">Account Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p>{user.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p>{user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Member Since</p>
                  <p>June 2025</p>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="font-medium mb-2">Preferences</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="emailNotifications"
                    defaultChecked={true}
                    className="mr-2"
                  />
                  <label htmlFor="emailNotifications">
                    Receive email notifications
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="darkMode"
                    defaultChecked={false}
                    className="mr-2"
                  />
                  <label htmlFor="darkMode">
                    Dark mode (coming soon)
                  </label>
                </div>
              </div>
            </div>
            
            <button
              onClick={logout}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Sign Out
            </button>
          </>
        ) : (
          <div className="text-center py-8">
            <h2 className="text-xl font-bold mb-4">You are not signed in</h2>
            <p className="mb-6 text-gray-600">
              Sign in to track and manage your job applications
            </p>
            <button
              onClick={handleLogin}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Sign In (Demo)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
