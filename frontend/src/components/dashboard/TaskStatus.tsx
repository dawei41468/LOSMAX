import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { CategoryHeader } from '../ui/CategoryUI';
import { Progress } from '../ui/progress'; // Import the Progress component
import type { Task } from '../../types/tasks';
import type { Goal, GoalCategory } from '../../types/goals';

interface TaskStatusProps {
  todayTasks: Task[];
  activeGoals: Goal[];
}

const TaskStatus: React.FC<TaskStatusProps> = ({ todayTasks, activeGoals }) => {
  const { t } = useTranslation();

  const completedTasksCount = todayTasks.filter(t => t.status === 'completed').length;
  const totalTasksCount = todayTasks.length;
  const completionPercentage = totalTasksCount > 0
    ? Math.round((completedTasksCount / totalTasksCount) * 100)
    : 0;

  const groupedGoalsByCategory = activeGoals.reduce((acc, goal) => {
    (acc[goal.category as GoalCategory] = acc[goal.category as GoalCategory] || []).push(goal);
    return acc;
  }, {} as Record<GoalCategory, Goal[]>);

  return (
    <Card
      variant="taskST"
      border="work"
      className="max-w-3xl w-full mx-auto"
    >
      <CardHeader>
        <CardTitle>{t('component.taskStatus.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <h3 className="card-subtitle">{t('component.taskStatus.completion')}</h3>
          <div className="flex items-center mt-2">
            <Progress value={completionPercentage} className="w-full" />
            <span className="ml-3 text-sm font-semibold">{completionPercentage}%</span>
          </div>
          <p className="text-muted mt-1">
            {t('component.taskStatus.completedCount', { completed: completedTasksCount, total: totalTasksCount })}
          </p>
        </div>

        <div>
          <h3 className="card-subtitle mb-3">{t('component.taskStatus.activeGoals')}</h3>
          {Object.keys(groupedGoalsByCategory).length === 0 && (
            <p className="text-muted">{t('component.taskStatus.noActiveGoals')}</p>
          )}
          {Object.keys(groupedGoalsByCategory).length > 0 && (
            <div className="space-y-3">
              {(['Family', 'Work', 'Health', 'Personal'] as GoalCategory[])
                .filter(category => groupedGoalsByCategory[category] && groupedGoalsByCategory[category].length > 0)
                .map(category => (
                  <div key={category} className="flex items-center">
                    <CategoryHeader category={category} />
                    <span className={`ml-2 text-sm font-semibold text-${category}`}>
                      ({groupedGoalsByCategory[category].length}/3)
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskStatus;