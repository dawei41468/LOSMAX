import { useContext } from 'react';
import { AuthContext } from '../contexts/auth.context';
import type { AuthContextType } from '../contexts/auth.types';
import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
  const { isAuthenticated } = useContext(AuthContext) as AuthContextType;
  const navigate = useNavigate();

  // The ProtectedRoute component in App.tsx already handles redirection if not authenticated.
  // This check provides an additional layer or can be page-specific for loading.
  if (isAuthenticated === false) {
    // This navigation might be redundant if ProtectedRoute always catches it first.
    // Consider if navigation here is still needed or if a simple null/message is better.
    navigate('/auth', { replace: true }); 
    return null;
  }

  if (isAuthenticated === null) {
    // Display a loading message while authentication status is being determined
    return <div className="p-6">Loading dashboard...</div>;
  }

  return (
    <div>
      {/* 
        The main title (e.g., "Dashboard") is now typically handled by DashboardLayout.tsx.
        If you need a subtitle or a more specific title for this page's content, 
        you can add it here. For example:
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">Overview</h2> 
      */}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Placeholder for dashboard widgets */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Welcome!</h2>
          <p className="text-gray-600">This is your personalized dashboard.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Quick Stats</h2>
          <p className="text-gray-600">Total Goals: X</p>
          <p className="text-gray-600">Active Tasks: Y</p>
        </div>
        {/* Add more dashboard widgets here as needed */}
      </div>
    </div>
  );
}