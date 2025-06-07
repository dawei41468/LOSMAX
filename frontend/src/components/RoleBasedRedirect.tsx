import { useContext } from 'react'
import { Navigate } from 'react-router-dom'
import { AuthContext } from '../contexts/auth.context'
import type { AuthContextType } from '../contexts/auth.types'

export const RoleBasedRedirect = () => {
  const { isAuthenticated, userRole } = useContext(AuthContext) as AuthContextType
  
  if (isAuthenticated === null) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-xl">Loading session...</div>
      </div>
    )
  }

  return userRole?.toLowerCase() === 'admin'
    ? <Navigate to="/admin" replace />
    : <Navigate to="/dashboard" replace />
}