import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../contexts/auth.context';
import type { AuthContextType } from '../contexts/auth.types';
import type { GoalCategory, Goal } from '../types/goals';
import type { Task } from '../types/tasks';
import { CategoryHeader} from '../components/ui/CategoryUI';
import { getCategoryColorClass, categoryColors } from '../components/ui/categoryUtils';
import ProgressGoalCard from '../components/progress/ProgressGoalCard';
import { Home, HeartPulse, Briefcase, User } from 'lucide-react';
import SelectMenu from '@/components/ui/select-menu';
import { useGoals } from '../hooks/useGoals';
import { useTasks } from '../hooks/useTasks';
import AppShell from '@/layouts/AppShell';

const ProgressPage: React.FC = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useContext(AuthContext) as AuthContextType;

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  // Server state via React Query
  const goalsQuery = useGoals({}); // all goals
  const tasksQuery = useTasks({}); // all tasks
  const goals: Goal[] = goalsQuery.data ?? [];
  const tasks: Task[] = tasksQuery.data ?? [];
  const isLoading = goalsQuery.isLoading || tasksQuery.isLoading;
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all');

  useEffect(() => {
    if (!isAuthenticated) return;
    // Data is fetched by React Query hooks
  }, [isAuthenticated]);


  const convertToGoalProgress = (goal: Goal, tasks: Task[]) => {
    const goalTasks = tasks.filter(task => task.goal_id === goal.id);
    const completedTasks = goalTasks.filter(task => task.status === 'completed').length; // Use string literal for TaskStatus
    const totalTasks = goalTasks.length;
    const progress = totalTasks > 0 ? completedTasks / totalTasks : 0;

    return {
      ...goal, // Spread existing goal properties
      progress,
      days_remaining: goal.target_date
        ? Math.ceil(((new Date(goal.target_date)).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : 0,
    };
  };

  const filteredGoals = goals
    .filter(goal =>
      (activeFilter === 'all' || goal.category === activeFilter) &&
      (statusFilter === 'all' ||
        (statusFilter === 'active' && !goal.completed_at) ||
        (statusFilter === 'completed' && !!goal.completed_at))
    );

  const groupedGoalsByCategory = filteredGoals.reduce((acc, goal) => {
    const category = goal.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(goal);
    return acc;
  }, {} as Record<string, Goal[]>);

  if (isLoading) {
    return <div className="text-center py-4">{t('actions.loading')}</div>;
  }

  return (
    <AppShell
      title={t('content.progress.title')}
      subtitle={t('content.progress.subtitle')}
      showBottomNav={true}
    >
      {/* Fixed filter/action row below AppShell header */}
      <div className="fixed left-0 right-0 top-[var(--app-header-h)] z-40 bg-surface py-2 px-app-content">
        <div className="flex items-center justify-between">
          <div className="flex justify-start">
            <SelectMenu
              variant="default"
              size="sm"
              value={statusFilter}
              onChange={(v) => setStatusFilter(v as 'all' | 'active' | 'completed')}
              items={[{value:'all',label:t('common.filter.all')},{value:'active',label:t('common.filter.active')},{value:'completed',label:t('common.filter.completed')}]}
              placeholder={t('common.filter.all')}
              className="min-w-[120px]"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              className={`px-2 py-1 rounded-full text-sm ${activeFilter === 'all' ? 'bg-secondary' : ''}`}
              style={activeFilter === 'all' ? { backgroundColor: 'var(--secondary)' } : {}}
              onClick={() => setActiveFilter('all')}
            >
              {t('common.filter.all')}
            </button>
            {["Family", "Work", "Health", "Personal"].map((category) => (
              <button
                key={category}
                className={`p-1.5 rounded-full ${activeFilter === category ? categoryColors[category as GoalCategory]?.primaryBg : ''}`}
                onClick={() => setActiveFilter(category)}
              >
                {category === 'Family' && <Home className={`h-4 w-4 ${activeFilter === category ? 'text-primary-foreground' : getCategoryColorClass(category as GoalCategory, 'primary')}`} />}
                {category === 'Health' && <HeartPulse className={`h-4 w-4 ${activeFilter === category ? 'text-primary-foreground' : getCategoryColorClass(category as GoalCategory, 'primary')}`} />}
                {category === 'Work' && <Briefcase className={`h-4 w-4 ${activeFilter === category ? 'text-primary-foreground' : getCategoryColorClass(category as GoalCategory, 'primary')}`} />}
                {category === 'Personal' && <User className={`h-4 w-4 ${activeFilter === category ? 'text-primary-foreground' : getCategoryColorClass(category as GoalCategory, 'primary')}`} />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Spacer to offset fixed filter bar height */}
      <div className="h-12" />

      {/* Main content */}
      <div className="space-y-4">
        {filteredGoals.length > 0 ? (
          <div className="space-y-6">
            {Object.keys(groupedGoalsByCategory).sort().map(category => {
              const goalsInCategory = groupedGoalsByCategory[category];
              return (
                <div key={category} className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <CategoryHeader category={category as GoalCategory} />
                    </div>
                    <span className="text-sm" style={{ color: 'var(--labels)' }}>
                      {t('content.progress.goalCount', { count: goalsInCategory.length })}
                    </span>
                  </div>
                  <div className="space-y-4">
                    {goalsInCategory.map(goal => (
                      <ProgressGoalCard
                        key={goal.id}
                        goal={convertToGoalProgress(goal, tasks)}
                        isCompleted={!!goal.completed_at}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-center py-4 text-gray-500 text-xl">{t('feedback.info.noGoalsFound')}</p>
        )}
      </div>
    </AppShell>
  );
};

export default ProgressPage;