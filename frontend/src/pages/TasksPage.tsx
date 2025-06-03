import React, { useState, useEffect } from 'react';
import { api } from '../services/api'; // Assuming you have a configured api service
import { toast } from 'sonner'; // For error notifications

// Define a type for the expected API response structure for preferences
interface UserPreferencesResponse {
  morning_deadline: string;
  // include other preferences if needed, though only morning_deadline is used here
}

const TasksPage: React.FC = () => {
  const [morningDeadline, setMorningDeadline] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPreferences = async () => {
      setIsLoading(true);
      try {
        const response = await api.get<UserPreferencesResponse>('/preferences');
        setMorningDeadline(response.data.morning_deadline);
      } catch (error) {
        console.error('Error fetching preferences:', error);
        toast.error('Failed to load your preferences.');
        // Set a default or leave as null if fetching fails
        setMorningDeadline('N/A');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPreferences();
  }, []);

  // The ProtectedRoute in App.tsx ensures this page is only accessed when authenticated.
  // Auth-specific checks or loading states can be minimal here or handled globally.
  return (
    <div className="p-4"> {/* Basic padding, can be adjusted as needed */}
      <h2 className="text-xl font-semibold mb-4">Tasks Page</h2>
      <p>This is a placeholder for the Tasks Page.</p>
      <p>Content related to managing tasks will be displayed here.</p>
      {isLoading ? (
        <p>Loading your preferences...</p>
      ) : morningDeadline && morningDeadline !== 'N/A' ? (
        <p className="mt-2">Your Morning Deadline is: {morningDeadline}</p>
      ) : morningDeadline === 'N/A' ? (
        <p className="mt-2 text-red-500">Could not load morning deadline.</p>
      ) : null}
    </div>
  );
};

export default TasksPage;