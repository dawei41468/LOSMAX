import React from 'react';
import { Progress } from '../ui/progress'; // Assuming a progress component exists or needs to be created
import type { Goal } from '../../types/goals';
import { useTranslation } from 'react-i18next';
import { getCategoryColorClass } from '../ui/CategoryUI';

interface ProgressGoalCardProps {
  goal: {
    id: string;
    title: string;
    targetDate: Date;
    progress: number;
    daysRemaining: number;
    completedAt?: Date;
  };
  isCompleted: boolean;
}

const ProgressGoalCard: React.FC<ProgressGoalCardProps> = ({ goal, isCompleted }) => {
  const { t } = useTranslation();

  const progressPercentage = Math.round(goal.progress * 100);
  const daysRemainingText = goal.daysRemaining > 0
    ? t('progressPage.analytics.daysRemaining', { count: goal.daysRemaining })
    : t('progressPage.analytics.pastDue');

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold mb-2">{goal.title}</h3>
      <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
        <span>{t('progressPage.analytics.targetDate')}: {goal.targetDate.toLocaleDateString()}</span>
        {isCompleted ? (
          <span className={getCategoryColorClass('Health', 'text')}>{t('progressPage.analytics.completed')}</span>
        ) : (
          <span className={getCategoryColorClass('Work', 'text')}>{daysRemainingText}</span>
        )}
      </div>
      <div className="flex items-center gap-2 mb-2">
        <Progress value={progressPercentage} className="w-full" />
        <span className="text-sm font-medium">{progressPercentage}%</span>
      </div>
      {isCompleted && goal.completedAt && (
        <p className="text-xs text-gray-500 mt-1">
          {t('progressPage.analytics.completedOn', { date: goal.completedAt.toLocaleDateString() })}
        </p>
      )}
    </div>
  );
};

export default ProgressGoalCard;