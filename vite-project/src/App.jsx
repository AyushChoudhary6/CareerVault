import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import './App.css'

// Context providers
import { AuthProvider } from './context/AuthContext'
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

// AppContent component to handle layout based on current route
const AppContent = () => {
  const location = useLocation();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="min-h-[calc(100vh-64px)]">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/jobs" element={<JobList />} />
          <Route path="/add-job" element={<AddJob />} />
          <Route path="/edit-job/:id" element={<AddJob />} />
          <Route path="/jobs/:id" element={<JobDetails />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <JobProvider>
        <Router>
          <AppContent />
        </Router>
      </JobProvider>
    </AuthProvider>
  );
}

export default App
