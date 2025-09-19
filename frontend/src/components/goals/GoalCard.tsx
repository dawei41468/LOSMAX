import React from 'react';
import { useTranslation } from 'react-i18next';
import type { Goal } from '../../types/goals';
import { Edit, Check, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/card';
import { formatDate, formatDateShort } from '../../lib/utils'; // Utility function to format dates
import { getCategoryColorClass } from '../ui/categoryUtils';
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

// Utility function to calculate progress percentage
const calculateProgress = (createdAtISOString: string, targetDateISOString: string): number => {
  const created = new Date(createdAtISOString);
  const target = new Date(targetDateISOString);
  const now = new Date();
  
  // If target date is in the past, return 0% (no time remaining)
  if (now >= target) return 0;
  
  // If current date is before creation date (shouldn't happen), return 100%
  if (now <= created) return 100;
  
  // Calculate total duration and remaining time
  const totalDuration = target.getTime() - created.getTime();
  const remainingTime = target.getTime() - now.getTime();
  
  // Calculate remaining percentage
  const progress = Math.round((remainingTime / totalDuration) * 100);
  
  // Clamp between 0 and 100
  return Math.max(0, Math.min(100, progress));
};

const GoalCard: React.FC<GoalCardProps> = ({ goal, onEdit, onDelete, onToggleStatus, useShortDate = true }) => {
  const { t } = useTranslation();
  const daysRemaining = calculateDaysRemaining(goal.target_date);
  const progressPercentage = calculateProgress(goal.created_at, goal.target_date);

  return (
    <Card
      variant="elevated"
      interactive={goal.status === 'active'}
      border="none"
      className="relative overflow-hidden"
    >
      {/* Category accent strip */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${getCategoryColorClass(goal.category, 'primaryBg')}`}></div>

      <CardHeader size="sm" spacing="tight">
        <div className="flex items-start justify-between w-full mb-2">
          <div className="flex-1 min-w-0">
            <CardTitle size="sm" color="none" className={`${getCategoryColorClass(goal.category, 'primary')} font-semibold mb-1 leading-tight`}>
              {goal.title}
            </CardTitle>
            {goal.description && (
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t('component.goalCard.details')}: {goal.description}
              </p>
            )}
          </div>
          <div className="flex-shrink-0 ml-3">
            <StatusBadge status={goal.status} />
          </div>
        </div>
      </CardHeader>

      <CardContent size="sm" spacing="none">
        <div className="relative">
          {/* Banner background */}
          <div className={`absolute inset-0 rounded-md border-1 ${getCategoryColorClass(goal.category, 'primary').replace('text-', 'border-')}`}></div>
          
          <div className="rounded-md p-3 relative z-10">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('component.goalCard.targetDate')}</div>
                <div className="text-sm font-medium">{useShortDate ? formatDateShort(goal.target_date) : formatDate(goal.target_date)}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('component.goalCard.daysLeft')}</div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold ${getCategoryColorClass(goal.category, 'primary')}`}>{daysRemaining}</span>
                  <div className="flex-1 bg-muted/50 rounded-full h-1.5 border border-border/20">
                    <div className={`${getCategoryColorClass(goal.category, 'primaryBg')} h-1 rounded-full transition-all duration-300`} style={{width: `${progressPercentage}%`}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter size="sm" align="between" spacing="tight">
        <div className={`text-xs px-2 py-1 rounded-full ${getCategoryColorClass(goal.category, 'bg')} ${getCategoryColorClass(goal.category, 'primary')} font-medium`}> 
          {t(`content.categories.${goal.category.toLowerCase()}`)}
        </div>
        <div className="flex gap-3">
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