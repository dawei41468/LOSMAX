import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import './styles/utility-system.css'
import AuthPage from './pages/AuthPage'
import GoalsPage from './pages/GoalsPage'
import TasksPage from './pages/TasksPage'
import DashboardPage from './pages/DashboardPage'
import ProgressPage from './pages/ProgressPage'
import ProfilePage from './pages/ProfilePage'
import AdminPage from './pages/AdminPage'
import { MainLayoutRoutes } from './routes/MainLayoutRoutes';
import { BottomNavLayout } from './components/dashboard/BottomNavLayout';
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { Toaster } from 'sonner'
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute'
import { RoleBasedRedirect } from './components/RoleBasedRedirect'
import { ThemeTransition } from './components/ui/theme-transition';

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <AuthProvider>
        <ThemeTransition>
          <BrowserRouter>
            <Toaster richColors position="top-right" /> {/* Add Toaster here */}
            <Routes>
              <Route path="/" element={<Navigate to="/auth" replace />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/profile" element={
                  <BottomNavLayout>
                    <ProfilePage />
                  </BottomNavLayout>
                } />
                <Route element={<MainLayoutRoutes />}>
                  <Route path="/" element={<RoleBasedRedirect />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/goals" element={<GoalsPage />} />
                  <Route path="/tasks" element={<TasksPage />} />
                  <Route path="/progress" element={<ProgressPage />} />
                </Route>
              </Route>

              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<AdminPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </ThemeTransition>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
