import React, { useState, useEffect } from 'react';
import type { Goal, GoalCategory } from '../../types/goals'; // Use type-only import, removed GoalStatus

// Define CATEGORIES locally as done in GoalsPage.tsx for LOSMAX
const CATEGORIES: GoalCategory[] = ["Family", "Work", "Health", "Personal"];

interface GoalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (goalData: Omit<Goal, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'days_remaining' | 'completed_at'>) => void;
  initialGoal?: Goal; // For editing
}

const GoalDialog: React.FC<GoalDialogProps> = ({ isOpen, onClose, onSubmit, initialGoal }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<GoalCategory>(CATEGORIES[0] as GoalCategory);
  const [targetDate, setTargetDate] = useState('');
  const [dateError, setDateError] = useState<string | null>(null);

  useEffect(() => {
    if (initialGoal) {
      setTitle(initialGoal.title);
      setDescription(initialGoal.description || '');
      setCategory(initialGoal.category);
      setTargetDate(initialGoal.target_date ? new Date(initialGoal.target_date).toISOString().split('T')[0] : '');
    } else {
      // Reset form for new goal
      setTitle('');
      setDescription('');
      setCategory(CATEGORIES[0] as GoalCategory);
      setTargetDate('');
    }
  }, [initialGoal, isOpen]); // Depend on isOpen to reset when dialog reopens for new goal

  const validateDate = (dateStr: string): boolean => {
    if (!dateStr) return false; // Date is mandatory
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Compare dates only
    return !isNaN(date.getTime()) && date >= today;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateDate(targetDate)) {
      setDateError('Target date must be today or a future date.');
      return;
    }
    setDateError(null);

    onSubmit({
      title,
      description: description || undefined, // Ensure undefined if empty, not empty string
      category,
      target_date: targetDate,
      status: initialGoal?.status || 'active', // Default to active or preserve existing status
    });
    onClose(); // Close dialog after submission
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50"> {/* Changed bg-opacity-50 to bg-black/30 */}
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">{initialGoal ? 'Edit Goal' : 'Create New Goal'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description (Optional)</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value as GoalCategory)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              {CATEGORIES.map((cat: GoalCategory) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="target_date" className="block text-sm font-medium text-gray-700">Target Date</label>
            <input
              type="date"
              id="target_date"
              value={targetDate}
              onChange={(e) => {
                setTargetDate(e.target.value);
                if (dateError) setDateError(null); // Clear error on change
              }}
              required
              min={new Date().toISOString().split('T')[0]} // Prevent past dates
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
            {dateError && <p className="text-xs text-red-500 mt-1">{dateError}</p>}
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {initialGoal ? 'Save Changes' : 'Create Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GoalDialog;