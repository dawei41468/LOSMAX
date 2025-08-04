import React from 'react';
import { Progress } from '@/components/ui/progress';
import type { Goal } from '../../types/goals';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { formatDateShort } from '../../lib/utils'; // Utility function to format dates

interface ProgressGoalCardProps {
  goal: Goal & { progress: number; days_remaining: number };
  isCompleted: boolean;
}

const ProgressGoalCard: React.FC<ProgressGoalCardProps> = ({ goal, isCompleted }) => {
  const { t } = useTranslation();

  const progressPercentage = Math.round(goal.progress * 100);

  const getCategoryColor = () => {
    const categoryColors: Record<string, string> = {
      family: 'text-purple-500',
      work: 'text-blue-500',
      personal: 'text-yellow-500',
      health: 'text-green-500',
    };
    return categoryColors[goal.category] || 'text-foreground';
  };

  const getCategoryBadgeColor = () => {
    const categoryColors: Record<string, string> = {
      family: 'badge-purple',
      work: 'badge-blue',
      personal: 'badge-yellow',
      health: 'badge-green',
    };
    return categoryColors[goal.category] || 'badge-secondary';
  };

  return (
    <Card variant="outline" size="sm" className="hover:shadow-md transition-shadow">
      <CardHeader spacing="tight">
        <CardTitle size="sm" className={getCategoryColor()}>
          {goal.title}
        </CardTitle>
      </CardHeader>

      <CardContent size="sm" spacing="tight">
        <div className="flex items-center justify-between text-sm mb-3">
          <div className="flex flex-col">
            <span className="text-muted-foreground">{t('component.goalCard.targetDate')}: {formatDateShort(goal.target_date)}</span>
          </div>
          
          {isCompleted ? (
            <span className={`badge badge-success`}>
              {t('common.completed')}
            </span>
          ) : (
            <div className={`badge ${getCategoryBadgeColor()}`}>
              <span className="font-bold">{goal.days_remaining}</span>
              <span className="text-xs ml-1">{t('component.goalCard.daysLeft', { count: goal.days_remaining })}</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Progress value={progressPercentage} className="w-full" />
          </div>
          
          <p className="text-center text-xs text-muted-foreground">
            {t('component.progressGoalCard.completionRate', { rate: progressPercentage })}
          </p>
          
          {isCompleted && goal.completed_at && (
            <p className="text-xs text-muted-foreground text-center">
              {t('component.progressGoalCard.completedOn', { date: formatDateShort(goal.completed_at)})}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgressGoalCard;