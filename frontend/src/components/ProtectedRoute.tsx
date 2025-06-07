import { useContext } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { AuthContext } from '../contexts/auth.context'
import type { AuthContextType } from '../contexts/auth.types'

export const ProtectedRoute = () => {
  const { isAuthenticated } = useContext(AuthContext) as AuthContextType
  
  if (isAuthenticated === null) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl">Loading session...</div>
      </div>
    )
  }
  
  return isAuthenticated ? <Outlet /> : <Navigate to="/auth" replace />
}

export const AdminRoute = () => {
  const { isAuthenticated, userRole } = useContext(AuthContext) as AuthContextType
  
  if (isAuthenticated === null) return null
  if (!isAuthenticated) return <Navigate to="/auth" replace />
  return userRole?.toLowerCase() === 'admin' ? <Outlet /> : <Navigate to="/dashboard" replace />
}