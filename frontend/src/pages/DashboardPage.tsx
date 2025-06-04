import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../contexts/auth.context';
import type { AuthContextType } from '../contexts/auth.types';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api'; // Import api service
import QuoteOfDay from '../components/dashboard/QuoteOfDay';
import UserInfo from '../components/dashboard/UserInfo';

// Define a type for the expected API response structure, matching Pydantic model
interface UserPreferencesResponse {
  morning_deadline: string;
  evening_deadline: string;
  notifications_enabled: boolean;
  language: string; // Language is part of preferences, but also in AuthContext
}

export default function DashboardPage() {
  const { isAuthenticated, userName, userId, userEmail, userRole, userLanguage } = useContext(AuthContext) as AuthContextType;
  const navigate = useNavigate();

  const [preferences, setPreferences] = useState<UserPreferencesResponse | null>(null);
  const [loadingPreferences, setLoadingPreferences] = useState(true);

  useEffect(() => {
    const fetchPreferences = async () => {
      if (isAuthenticated) {
        try {
          setLoadingPreferences(true);
          const response = await api.get('/preferences');
          setPreferences(response.data as UserPreferencesResponse);
        } catch (error) {
          console.error('Error fetching preferences for dashboard:', error);
          // Optionally, set an error state to display a message to the user
        } finally {
          setLoadingPreferences(false);
        }
      }
    };

    fetchPreferences();
  }, [isAuthenticated]);

  // The ProtectedRoute component in App.tsx already handles redirection if not authenticated.
  // This check provides an additional layer or can be page-specific for loading.
  if (isAuthenticated === false) {
    // This navigation might be redundant if ProtectedRoute always catches it first.
    // Consider if navigation here is still needed or if a simple null/message is better.
    navigate('/auth', { replace: true }); 
    return null;
  }

  if (isAuthenticated === null || (isAuthenticated && loadingPreferences)) {
    // Display a loading message while authentication status or preferences are being determined
    return <div className="p-6">Loading dashboard...</div>;
  }

  return (
    <div className="mt-4 space-y-6">
      {/* 
        The main title (e.g., "Dashboard") is now typically handled by DashboardLayout.tsx.
        If you need a subtitle or a more specific title for this page's content, 
        you can add it here. For example:
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">Overview</h2> 
      */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <UserInfo
          userName={userName}
          userId={userId}
          userEmail={userEmail}
          userRole={userRole}
          userLanguage={userLanguage}
          preferences={preferences}
        />
        <QuoteOfDay />
        {/* Placeholder for dashboard widgets */}
      </div>
    </div>
  );
}