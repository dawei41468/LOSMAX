import React from 'react';
import { useTranslation } from 'react-i18next';
import { getCategoryColorClass, CategoryHeader } from '../ui/CategoryUI';
import type { Task } from '../../services/api';
import type { Goal, GoalCategory } from '../../types/goals';

interface DashStatusProps {
  todayTasks: Task[];
  activeGoals: Goal[];
}

const DashStatus: React.FC<DashStatusProps> = ({ todayTasks, activeGoals }) => {
  const { t } = useTranslation();

  const completedTasksCount = todayTasks.filter(t => t.status === 'complete').length;
  const totalTasksCount = todayTasks.length;
  const completionPercentage = totalTasksCount > 0
    ? Math.round((completedTasksCount / totalTasksCount) * 100)
    : 0;

  const groupedGoalsByCategory = activeGoals.reduce((acc, goal) => {
    (acc[goal.category as GoalCategory] = acc[goal.category as GoalCategory] || []).push(goal);
    return acc;
  }, {} as Record<GoalCategory, Goal[]>);

  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">{t('dashboard.today_status')}</h2>

      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-700">{t('dashboard.task_completion')}</h3>
        <div className="flex items-center mt-2">
          <div className="w-full bg-gray-100 rounded-full h-2.5 dark:bg-gray-700">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
          <span className="ml-3 text-sm font-medium text-gray-700">{completionPercentage}%</span>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          {t('dashboard.completed_tasks_count', { completed: completedTasksCount, total: totalTasksCount })}
        </p>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-700 mb-3">{t('dashboard.active_goals_by_category')}</h3>
        {Object.keys(groupedGoalsByCategory).length === 0 && (
          <p className="text-sm text-gray-500">{t('dashboard.no_active_goals')}</p>
        )}
        {Object.keys(groupedGoalsByCategory).length > 0 && (
          <div className="space-y-3">
            {(['Family', 'Work', 'Health', 'Personal'] as GoalCategory[])
              .filter(category => groupedGoalsByCategory[category] && groupedGoalsByCategory[category].length > 0)
              .map(category => (
                <div key={category} className="flex items-center">
                  <CategoryHeader category={category} />
                  <span className={`ml-2 text-sm font-medium ${getCategoryColorClass(category, 'text')}`}>
                    ({groupedGoalsByCategory[category].length})
                  </span>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashStatus;