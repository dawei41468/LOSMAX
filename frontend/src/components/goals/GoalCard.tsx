import React from 'react';
import type { Goal } from '../../types/goals'; // Removed GoalCategory
// import { CATEGORIES } from '../../utils/constants'; // Not needed here, category comes from Goal prop

interface GoalCardProps {
  goal: Goal;
  onEdit: (goal: Goal) => void;
  onDelete: (goalId: string) => void;
  onToggleStatus: (goal: Goal) => void; // To mark complete or reopen
}

// Utility function to calculate days_remaining (can be moved to a utils file later)
const calculateDaysRemaining = (targetDateISOString: string): number => {
  const target = new Date(targetDateISOString);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Compare dates only
  target.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - today.getTime();
  if (diffTime < 0) return 0; // Or handle as overdue, e.g., negative number
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

const GoalCard: React.FC<GoalCardProps> = ({ goal, onEdit, onDelete, onToggleStatus }) => {
  const daysRemaining = calculateDaysRemaining(goal.target_date);

  const cardBorderColor = () => {
    switch (goal.category) {
      case 'Family': return 'border-blue-500';
      case 'Work': return 'border-purple-500';
      case 'Health': return 'border-green-500';
      case 'Personal': return 'border-yellow-500';
      default: return 'border-gray-300';
    }
  };

  const statusBadgeColor = () => {
    return goal.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  return (
    <div className={`bg-white shadow-md hover:shadow-lg transition-shadow duration-200 rounded-lg p-5 border-l-2 ${cardBorderColor()} flex flex-col justify-between`}> {/* Increased padding, added hover shadow */}
      <div>
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-800">{goal.title}</h3>
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusBadgeColor()}`}>
            {goal.status}
          </span>
        </div>
        {goal.description && <p className="text-sm text-gray-600 mb-2 text-left">Details: {goal.description}</p>}
        <p className="text-sm text-gray-500 text-left">Target Date: <span className="font-medium">{new Date(goal.target_date).toLocaleDateString()}</span></p>
        <p className="text-sm text-gray-500 text-left">
          Days Remaining: <span className={`font-medium ${daysRemaining === 0 && goal.status === 'active' ? 'text-red-500' : ''}`}>
            {daysRemaining} {daysRemaining === 0 && goal.status === 'active' ? '(Due Today/Overdue)' : ''}
          </span>
        </p>
      </div>
      <div className="mt-4 flex justify-end space-x-2">
        <button
          onClick={() => onEdit(goal)}
          className="px-3 py-1.5 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 transition-colors" // Increased text size, adjusted padding, added rounded-md and transition
        >
          Edit
        </button>
        <button
          onClick={() => onToggleStatus(goal)}
          className={`px-3 py-1.5 text-sm font-medium text-white rounded-md transition-colors ${goal.status === 'active' ? 'bg-green-500 hover:bg-green-600' : 'bg-yellow-500 hover:bg-yellow-600'}`} // Increased text size, adjusted padding, added rounded-md and transition
        >
          {goal.status === 'active' ? 'Complete' : 'Reopen'}
        </button>
        <button
          onClick={() => onDelete(goal.id)}
          className="px-3 py-1.5 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 transition-colors" // Increased text size, adjusted padding, added rounded-md and transition
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default GoalCard;