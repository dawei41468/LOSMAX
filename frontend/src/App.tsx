import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import './App.css'
import AuthPage from './pages/AuthPage'
import GoalsPage from './pages/GoalsPage'
import TasksPage from './pages/TasksPage'
import DashboardPage from './pages/DashboardPage'
import ProgressPage from './pages/ProgressPage' // Import the new page
import SettingsPage from './pages/SettingsPage' // Import the new page
import { MainLayoutRoutes } from './routes/MainLayoutRoutes' // Import the new layout wrapper
import { AuthProvider } from './contexts/AuthContext'
import { AuthContext } from './contexts/auth.context'
import { useContext } from 'react'
import type { AuthContextType } from './contexts/auth.types'
import { Toaster } from 'sonner' // Import Toaster from sonner

const ProtectedRoute = () => {
  const { isAuthenticated } = useContext(AuthContext) as AuthContextType
  
  // Handle loading state
  if (isAuthenticated === null) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl">Loading session...</div>
      </div>
    )
  }
  
  return isAuthenticated ? <Outlet /> : <Navigate to="/auth" replace />
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster richColors position="top-right" /> {/* Add Toaster here */}
        <Routes>
          <Route path="/" element={<Navigate to="/auth" replace />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayoutRoutes />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} /> {/* Default for authenticated users */}
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/goals" element={<GoalsPage />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/progress" element={<ProgressPage />} /> {/* Use the new ProgressPage */}
              <Route path="/settings" element={<SettingsPage />} /> {/* Use the new SettingsPage */}
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
