import React from 'react';
import { useTranslation } from 'react-i18next';
import type { Goal } from '../../types/goals';
import { Edit, Check, Trash2 } from 'lucide-react';

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

  const getDaysRemainingClass = () => {
    return daysRemaining === 0 && goal.status === 'active' ? 'text-error' : 'text-muted';
  };

  return (
    <div className={`card border-l-${goal.category}`}>
      <div className="card-content">
        <div className="card-header">
          <h3 className={`heading-lg text-${goal.category.toLowerCase()}`}>{goal.title}</h3>
          <span className={`badge badge-${goal.status}`}>
            {t(`common.status.${goal.status}`)}
          </span>
        </div>
        {goal.description && (
          <p className="text-sm text-muted">{t('goals.card.details')}: {goal.description}</p>
        )}
        <p className="text-sm text-muted">{t('goals.card.target_date')}: <span className="font-medium">{new Date(goal.target_date).toLocaleDateString()}</span></p>
        <p className="text-sm text-muted">
          {t('goals.card.days_remaining')}: <span className={`font-medium ${getDaysRemainingClass()}`}>
            {daysRemaining} {daysRemaining === 0 && goal.status === 'active' ? t('goals.card.due_today_overdue') : ''}
          </span>
        </p>
      </div>
      <div className="flex gap-2 justify-end">
        <button
          onClick={() => onEdit(goal)}
          aria-label={t('common.edit_button')}
          className="btn btn-ghost btn-sm"
        >
          <Edit className="w-4 h-4" />
        </button>
        <button
          onClick={() => onToggleStatus(goal)}
          aria-label={goal.status === 'active' ? t('goals.card.complete_button') : t('goals.card.reopen_button')}
          className={`btn btn-sm ${goal.status === 'active' ? 'btn-success' : 'btn-secondary'}`}
        >
          <Check className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(goal.id)}
          aria-label={t('common.delete_button')}
          className="btn btn-destructive btn-sm"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default GoalCard;