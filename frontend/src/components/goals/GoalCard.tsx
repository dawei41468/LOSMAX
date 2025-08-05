import React from 'react';
import { useTranslation } from 'react-i18next';
import type { Goal } from '../../types/goals';
import { Edit, Check, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/card';
import { formatDate, formatDateShort } from '../../lib/utils'; // Utility function to format dates
import { getCategoryBorderVariant, getCategoryColorClass } from '../ui/categoryUtils';
import { StatusBadge } from '../ui/BadgeUI';

interface GoalCardProps {
  goal: Goal;
  onEdit: (goal: Goal) => void;
  onDelete: (goalId: string) => void;
  onToggleStatus: (goal: Goal) => void; // To mark complete or reopen
  useShortDate?: boolean;
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

const GoalCard: React.FC<GoalCardProps> = ({ goal, onEdit, onDelete, onToggleStatus, useShortDate = true }) => {
  const { t } = useTranslation();
  const daysRemaining = calculateDaysRemaining(goal.target_date);

  const getDaysRemainingClass = () => {
    return daysRemaining === 0 && goal.status === 'active' ? 'text-error' : 'text-muted';
  };

  return (
    <Card
      variant="elevated"
      interactive={goal.status === 'active'}
      border={getCategoryBorderVariant(goal.category)}
      size="none">
      <CardHeader>
        <div className="flex items-start justify-between w-full">
          <CardTitle size="sm" color="none" className={getCategoryColorClass(goal.category)}>
            {goal.title}
          </CardTitle>
          <StatusBadge status={goal.status} />
        </div>
      </CardHeader>

      {goal.description && (
        <CardContent spacing="tight">
          <p className="text-sm text-muted-foreground text-left">
            {t('component.goalCard.details')}: {goal.description}
          </p>
        </CardContent>
      )}

      <CardContent spacing="tight">
        <p className="text-sm text-left">
          {t('component.goalCard.targetDate')}: {useShortDate ? formatDateShort(goal.target_date) : formatDate(goal.target_date)}
        </p>
        <p className="text-sm text-left">
          {t('component.goalCard.daysLeft')}:{' '}
          <span className={`font-medium ${getDaysRemainingClass()}`}>
            {daysRemaining}
            {daysRemaining === 0 && goal.status === 'active'
              ? ` ${t('component.goalCard.dueTodayOverdue')}`
              : ''}
          </span>
        </p>
      </CardContent>

      <CardFooter align="right" spacing="loose">
        <div className="flex gap-4">
          <button
            onClick={() => onEdit(goal)}
            aria-label={t('actions.edit')}
            className="btn btn-ghost btn-sm"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onToggleStatus(goal)}
            aria-label={goal.status === 'active' ? t('actions.complete') : t('actions.reopen')}
            className="btn btn-ghost btn-sm"
          >
            <Check className={`w-4 h-4 ${goal.status === 'active' ? 'text-success' : 'text-warning'}`} />
          </button>
          <button
            onClick={() => onDelete(goal.id)}
            aria-label={t('actions.delete')}
            className="btn btn-ghost btn-sm"
          >
            <Trash2 className="w-4 h-4 text-destructive" />
          </button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default GoalCard;