import React from 'react';
import { Progress } from '@/components/ui/progress';
import type { Goal } from '../../types/goals';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { formatDateShort } from '../../lib/utils'; // Utility function to format dates
import { getCategoryBorderVariant, getCategoryColorClass } from '../ui/categoryUtils';
import { StatusBadge } from '../ui/BadgeUI';

interface ProgressGoalCardProps {
  goal: Goal & { progress: number; days_remaining: number };
  isCompleted: boolean;
}

const ProgressGoalCard: React.FC<ProgressGoalCardProps> = ({ goal, isCompleted }) => {
  const { t } = useTranslation();

  const progressPercentage = Math.round(goal.progress * 100);

  return (
    <Card variant="elevated" size="none" border={getCategoryBorderVariant(goal.category)}>
      <CardHeader spacing="tight">
        <div className="flex items-start justify-between w-full">
          <CardTitle size="sm" className={getCategoryColorClass(goal.category)}>
            {goal.title}
          </CardTitle>
          <StatusBadge status={goal.status} />
        </div>
      </CardHeader>

      <CardContent size="sm" spacing="tight">
        <div className="flex items-center justify-between text-sm mb-3">
          <div className="flex flex-col">
            <span className="text-muted-foreground">{t('component.goalCard.targetDate')}: {formatDateShort(goal.target_date)}</span>
          </div>
          
          {/* Display days remaining only if not completed */}
          {!isCompleted && (
            <div className="badge">
              <span className="font-bold">{goal.days_remaining}</span>
              <span className="text-xs ml-1">{t('component.goalCard.daysLeft', { count: goal.days_remaining })}</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Progress value={progressPercentage} className="w-full" />
          </div>
          
          <p className="text-xs text-muted-foreground text-left">
            {t('component.progressGoalCard.completionRate', { rate: progressPercentage })}
          </p>
          
          {isCompleted && goal.completed_at && (
            <p className="text-xs text-muted-foreground text-left">
              {t('component.progressGoalCard.completedOn', { date: formatDateShort(goal.completed_at)})}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgressGoalCard;