import React from 'react';
import { Progress } from '@/components/ui/progress';
import type { Goal } from '../../types/goals';
import { useTranslation } from 'react-i18next';
// Removed unused import

interface ProgressGoalCardProps {
  goal: Goal & { progress: number; days_remaining: number };
  isCompleted: boolean;
}

const ProgressGoalCard: React.FC<ProgressGoalCardProps> = ({ goal, isCompleted }) => {
  const { t } = useTranslation();

  const progressPercentage = Math.round(goal.progress * 100);
  // daysRemainingText is no longer directly used in the new UI, but the logic for determining past due/due today might still be relevant for styling.
  // For now, we'll keep the calculation but remove the variable if it's truly unused.
  // const daysRemainingText = goal.days_remaining > 0
  //   ? t('progressPage.analytics.daysRemaining', { count: goal.days_remaining })
  //   : goal.days_remaining === 0
  //     ? t('progressPage.analytics.dueToday')
  //     : t('progressPage.analytics.pastDue');

  return (
    <div className="card card-compact">
      <h3 className="card-title">{goal.title}</h3>
      <div className="flex items-center justify-between text-sm">
        <div className="flex flex-col">
          <span>{t('progressPage.analytics.targetDate')}:</span>
          <span className="font-semibold">{new Date(goal.target_date).toLocaleDateString()}</span>
        </div>
        {isCompleted ? (
          <span className={`text-${goal.category}`}>{t('common.status.completed')}</span>
        ) : (
          <div className={`badge badge-${goal.category}`}>
            <span className="font-bold">{goal.days_remaining}</span>
            <span className="text-xs">{t('progressPage.analytics.daysLeftLabel')}</span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Progress value={progressPercentage} className="w-full" />
      </div>
      <p className="text-center text-xs text-muted">
        {t('progressPage.analytics.completionRate')}{progressPercentage}%
      </p>
      {isCompleted && goal.completed_at && (
        <p className="text-xs text-muted mt-1 text-center">
          {t('progressPage.analytics.completedOn', { date: new Date(goal.completed_at).toLocaleDateString() })}
        </p>
      )}
    </div>
  );
};

export default ProgressGoalCard;