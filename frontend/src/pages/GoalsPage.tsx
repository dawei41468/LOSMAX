import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/auth.context';
import type { AuthContextType } from '../contexts/auth.types';
import { createGoal, getGoals } from '../services/api'; // These functions need to be implemented in api.ts
import { useNavigate } from 'react-router-dom';

// Hardcoding categories for now, ideally fetched from backend
const CATEGORIES = ["Family", "Work", "Health", "Personal"];

interface Goal {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  category: string;
  status: 'active' | 'completed';
  created_at: string;
  updated_at: string;
}

export default function GoalsPage() {
  const { isAuthenticated } = useContext(AuthContext) as AuthContextType; // Removed logout
  const navigate = useNavigate();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoal, setNewGoal] = useState({ title: '', description: '', category: CATEGORIES[0] });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    fetchGoals();
  }, [isAuthenticated, navigate]);

  const fetchGoals = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedGoals = await getGoals(); // This function needs to be implemented in api.ts
      setGoals(fetchedGoals);
    } catch (err: unknown) {
      console.error('Failed to fetch goals:', err);
      let errorMessage = 'Failed to load goals.';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null && 'detail' in err && typeof err.detail === 'string') {
        errorMessage = err.detail;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewGoal(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const created = await createGoal(newGoal); // This function needs to be implemented in api.ts
      setGoals(prev => [...prev, created]);
      setNewGoal({ title: '', description: '', category: CATEGORIES[0] }); // Reset form
    } catch (err: unknown) {
      console.error('Failed to create goal:', err);
      let errorMessage = 'Failed to create goal.';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null && 'detail' in err && typeof err.detail === 'string') {
        errorMessage = err.detail;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const groupedGoals = goals.reduce((acc, goal) => {
    (acc[goal.category] = acc[goal.category] || []).push(goal);
    return acc;
  }, {} as Record<string, Goal[]>);

  return (
    // Removed min-h-screen, w-full, bg-gray-100, p-4 sm:p-8 as DashboardLayout handles this
    <div>
      {/* The main title is now handled by DashboardLayout. This can be a page-specific sub-header. */}
      <div className="flex justify-between items-center mb-6"> {/* Adjusted margin */}
        <h1 className="text-2xl font-semibold text-gray-800">Your Goals</h1> {/* Adjusted styling */}
        {/* Logout button removed */}
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Create New Goal</h2>
        <form onSubmit={handleCreateGoal} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={newGoal.title}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description (Optional)</label>
            <textarea
              id="description"
              name="description"
              value={newGoal.description}
              onChange={handleInputChange}
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            ></textarea>
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
            <select
              id="category"
              name="category"
              value={newGoal.category}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isLoading ? 'Creating...' : 'Create Goal'}
          </button>
        </form>
      </div>

      {isLoading && <p>Loading goals...</p>}
      {!isLoading && goals.length === 0 && !error && <p>No goals found. Create one above!</p>}

      {Object.keys(groupedGoals).map(category => (
        <div key={category} className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">{category} Goals</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {groupedGoals[category].map(goal => (
              <div key={goal.id} className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-bold text-gray-900">{goal.title}</h3>
                <p className="text-gray-600 text-sm mt-1">{goal.description}</p>
                <span className={`inline-block mt-3 px-3 py-1 text-xs font-semibold rounded-full ${goal.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {goal.status}
                </span>
                {/* Add edit/delete buttons here later */}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}