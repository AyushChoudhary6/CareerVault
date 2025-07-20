import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import './App.css'
import { useAuth } from './context/AuthContext'

// Context providers
import { JobProvider } from './context/JobContext'

// Components
import Navbar from './components/Navbar'

// Pages
import HomePage from './pages/HomePage'
import AuthPage from './pages/AuthPage'
import Dashboard from './pages/Dashboard'
import JobList from './pages/JobList'
import AddJob from './pages/AddJob'
import JobDetails from './pages/JobDetails'
import Analytics from './pages/Analytics'
import Profile from './pages/Profile'
import CareerAssistant from './pages/CareerAssistant'

// Simple Auth Component
const AuthWrapper = ({ children }) => {
  const auth = useAuth()

  console.log('Auth state:', {
    isLoading: auth.isLoading,
    isAuthenticated: auth.isAuthenticated,
    error: auth.error?.message
  });

  if (auth.isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (auth.error) {
    return (
      <div className="flex items-center justify-center min-h-screen flex-col space-y-4">
        <div>Encountering error... {auth.error.message}</div>
        <button 
          onClick={() => auth.clearStaleState()}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Clear and Retry
        </button>
      </div>
    )
  }

  if (auth.isAuthenticated) {
    return (
      <div>
        <div className="p-4 bg-blue-100 border-b">
          <span>Hello: {auth.user?.profile?.email || auth.user?.email || 'User'}</span>
          <button 
            onClick={() => auth.removeUser()} 
            className="ml-4 px-4 py-2 bg-red-500 text-white rounded"
          >
            Sign out
          </button>
        </div>
        {children}
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen space-x-4">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Welcome to CareerVault</h1>
        <button 
          onClick={() => auth.signinRedirect()}
          className="px-6 py-3 bg-blue-500 text-white rounded"
        >
          Sign in with Cognito
        </button>
      </div>
    </div>
  )
}

// AppContent component to handle layout based on current route
const AppContent = () => {
  const location = useLocation();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="min-h-[calc(100vh-64px)]">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/jobs" element={<JobList />} />
          <Route path="/add-job" element={<AddJob />} />
          <Route path="/edit-job/:id" element={<AddJob />} />
          <Route path="/jobs/:id" element={<JobDetails />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/career-assistant" element={<CareerAssistant />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthWrapper>
      <JobProvider>
        <Router>
          <AppContent />
        </Router>
      </JobProvider>
    </AuthWrapper>
  );
}

export default App
