import React from 'react';
import { useTranslation } from 'react-i18next';
import { CategoryHeader } from '../ui/CategoryUI';
import type { Task } from '../../services/api';
import type { Goal, GoalCategory } from '../../types/goals';

interface TaskStatusProps {
  todayTasks: Task[];
  activeGoals: Goal[];
}

const TaskStatus: React.FC<TaskStatusProps> = ({ todayTasks, activeGoals }) => {
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
    <div className="card card-blue">
      <h2 className="card-title">{t('dashboard.today_status')}</h2>

      <div className="mb-6">
        <h3 className="card-subtitle">{t('dashboard.task_completion')}</h3>
        <div className="flex items-center mt-2">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
          <span className="ml-3 text-sm font-semibold">{completionPercentage}%</span>
        </div>
        <p className="text-muted mt-1">
          {t('dashboard.completed_tasks_count', { completed: completedTasksCount, total: totalTasksCount })}
        </p>
      </div>

      <div>
        <h3 className="card-subtitle mb-3">{t('dashboard.active_goals_by_category')}</h3>
        {Object.keys(groupedGoalsByCategory).length === 0 && (
          <p className="text-muted">{t('dashboard.no_active_goals')}</p>
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
    </div>
  );
};

export default TaskStatus;