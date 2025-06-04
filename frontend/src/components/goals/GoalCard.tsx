import React from 'react';
import { useTranslation } from 'react-i18next';
import type { Goal } from '../../types/goals';
import { Edit, Check, Trash2 } from 'lucide-react';
import { getCategoryColorClass } from '../ui/CategoryUI';
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
  const { t } = useTranslation();
  const daysRemaining = calculateDaysRemaining(goal.target_date);

  const cardBorderColor = () => {
    const color = getCategoryColorClass(goal.category, 'primary');
    return color ? color : 'border-l-gray-300';
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
            {t(`common.status.${goal.status}`)}
          </span>
        </div>
        {goal.description && <p className="text-sm text-gray-600 mb-2 text-left">{t('goals.card.details')}: {goal.description}</p>}
        <p className="text-sm text-gray-500 text-left">{t('goals.card.target_date')}: <span className="font-medium">{new Date(goal.target_date).toLocaleDateString()}</span></p>
        <p className="text-sm text-gray-500 text-left">
          {t('goals.card.days_remaining')}: <span className={`font-medium ${daysRemaining === 0 && goal.status === 'active' ? 'text-red-500' : ''}`}>
            {daysRemaining} {daysRemaining === 0 && goal.status === 'active' ? t('goals.card.due_today_overdue') : ''}
          </span>
        </p>
      </div>
      <div className="mt-4 flex justify-center space-x-8">
        <button
          onClick={() => onEdit(goal)}
          aria-label={t('common.edit_button')}
          className="p-2 rounded-md transition-colors"
        >
          <Edit className="w-5 h-5 text-blue-500" />
        </button>
        <button
          onClick={() => onToggleStatus(goal)}
          aria-label={goal.status === 'active' ? t('goals.card.complete_button') : t('goals.card.reopen_button')}
          className={`p-2 rounded-md transition-colors ${goal.status === 'active' ? 'hover:text-green-600' : 'hover:text-yellow-600'}`}
        >
          <Check className={`w-5 h-5 ${goal.status === 'active' ? 'text-green-500' : 'text-yellow-500'}`} />
        </button>
        <button
          onClick={() => onDelete(goal.id)}
          aria-label={t('common.delete_button')}
          className="p-2 rounded-md transition-colors hover:text-red-600"
        >
          <Trash2 className="w-5 h-5 text-red-500" />
        </button>
      </div>
    </div>
  );
};

export default GoalCard;