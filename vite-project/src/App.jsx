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
import AddJob from './pages/AddJob'
import Profile from './pages/Profile'
import CareerAssistant from './pages/CareerAssistant'

// Simple Auth Component
const AuthWrapper = ({ children }) => {
  const auth = useAuth()

  console.log('Auth state:', {
    isLoading: auth.isLoading,
    isAuthenticated: auth.isAuthenticated,
    error: auth.error,
    user: auth.user ? 'User loaded' : 'No user'
  });

  // Handle loading state
  if (auth.isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <div>Loading...</div>
      </div>
    </div>
  }

  // Handle error state
  if (auth.error) {
    return (
      <div className="flex items-center justify-center min-h-screen flex-col space-y-4">
        <div>Error: {auth.error}</div>
        <button 
          onClick={() => {
            console.log('Clearing auth state and reloading');
            localStorage.clear();
            sessionStorage.clear();
            window.location.href = '/';
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Clear and Retry
        </button>
      </div>
    )
  }

  // Handle authenticated state
  if (auth.isAuthenticated) {
    return (
      <JobProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            
            <main className="min-h-[calc(100vh-64px)]">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/login" element={<Dashboard />} />
                <Route path="/auth" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/add-job" element={<AddJob />} />
                <Route path="/edit-job/:id" element={<AddJob />} />
                <Route path="/career-assistant" element={<CareerAssistant />} />
                <Route path="/profile" element={<Profile />} />
              </Routes>
            </main>
          </div>
        </Router>
      </JobProvider>
    )
  }

  // Handle unauthenticated state - show homepage
  return (
    <JobProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          
          <main className="min-h-[calc(100vh-64px)]">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<HomePage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/dashboard" element={<AuthPage />} />
              <Route path="/add-job" element={<AuthPage />} />
              <Route path="/edit-job/:id" element={<AuthPage />} />
              <Route path="/career-assistant" element={<AuthPage />} />
              <Route path="/profile" element={<AuthPage />} />
            </Routes>
          </main>
        </div>
      </Router>
    </JobProvider>
  )
}

function App() {
  return <AuthWrapper />;
}

export default App
