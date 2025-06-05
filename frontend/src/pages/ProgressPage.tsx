import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../contexts/auth.context';
import type { AuthContextType } from '../contexts/auth.types';
import { getGoals, getTasks } from '../services/api';
import type { GoalCategory, Goal } from '../types/goals';
import type { Task } from '../services/api';
import { CategoryHeader, getCategoryColorClass, categoryColors } from '../components/ui/CategoryUI';
import { toast } from 'sonner';
import ProgressStats from '../components/progress/ProgressStats';
import ProgressGoalCard from '../components/progress/ProgressGoalCard';
import { Home, HeartPulse, Briefcase, User } from 'lucide-react';

const ProgressPage: React.FC = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useContext(AuthContext) as AuthContextType;
  const [goals, setGoals] = useState<Goal[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all');

  const fetchProgressData = useCallback(async () => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const fetchedGoals = await getGoals(); // Fetch all goals for progress tracking
      const fetchedTasks = await getTasks(); // Fetch all tasks
      setGoals(fetchedGoals);
      setTasks(fetchedTasks);
    } catch (err: unknown) {
      console.error('Failed to fetch progress data:', err);
      let errorMessage = 'Failed to load progress data.';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null && 'detail' in err && typeof (err as { detail: string }).detail === 'string') {
        errorMessage = (err as { detail: string }).detail;
      }
      toast.error(t('common.error_message', { error: errorMessage }));
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, t]);

  useEffect(() => {
    fetchProgressData();
  }, [fetchProgressData]);

  const totalGoals = goals?.length || 0;
  const completedGoals = goals?.filter(g => !!g.completed_at).length || 0;
  const inProgressGoals = totalGoals - completedGoals;
  
  const allTasksCount = tasks?.length || 0;
  const completedTasksCount = tasks?.filter(t => t.status === 'complete').length || 0; // Use string literal for TaskStatus
  const avgProgress = allTasksCount > 0
    ? Math.round((completedTasksCount / allTasksCount) * 100)
    : 0;

  const convertToGoalProgress = (goal: Goal, tasks: Task[]) => {
    const goalTasks = tasks.filter(task => task.goal_id === goal.id);
    const completedTasks = goalTasks.filter(task => task.status === 'complete').length; // Use string literal for TaskStatus
    const totalTasks = goalTasks.length;
    const progress = totalTasks > 0 ? completedTasks / totalTasks : 0;

    return {
      id: goal.id,
      title: goal.title,
      targetDate: goal.target_date ? new Date(goal.target_date) : new Date(),
      progress,
      daysRemaining: goal.target_date
        ? Math.ceil(((new Date(goal.target_date)).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : 0,
      completedAt: goal.completed_at ? new Date(goal.completed_at) : undefined
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
    return <div className="text-center py-4">{t('common.loading')}</div>;
  }

  return (
    <div className="space-y-6 px-4 py-2">
      {/* Overall Progress Section */}
      <div>
        <h2 className="text-xl font-bold mb-3">{t('progressPage.overview')}</h2>
        <ProgressStats
          totalGoals={totalGoals}
          completedGoals={completedGoals}
          inProgressGoals={inProgressGoals}
          avgProgress={avgProgress}
        />
      </div>

      {/* Goals Analytics Section */}
      <div>
        <h2 className="text-xl font-bold mb-3">{t('progressPage.analytics.title')}</h2>
        
        <div className="flex items-center gap-1 mb-6">
          <button
            className={`px-3 py-1 rounded-full text-sm ${activeFilter === 'all' ? 'bg-gray-200' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            {t('progressPage.analytics.all')}
          </button>
          {(["Family", "Work", "Health", "Personal"] as GoalCategory[]).map(category => (
            <button
              key={category}
              className={`p-2 rounded-full ${activeFilter === category ? categoryColors[category as GoalCategory]?.primaryBg : ''}`}
              style={{}}
              onClick={() => setActiveFilter(category)}
            >
              {category === 'Family' && <Home className={`h-4 w-4 ${activeFilter === category ? 'text-white' : getCategoryColorClass(category as GoalCategory, 'primary')}`} />}
              {category === 'Health' && <HeartPulse className={`h-4 w-4 ${activeFilter === category ? 'text-white' : getCategoryColorClass(category as GoalCategory, 'primary')}`} />}
              {category === 'Work' && <Briefcase className={`h-4 w-4 ${activeFilter === category ? 'text-white' : getCategoryColorClass(category as GoalCategory, 'primary')}`} />}
              {category === 'Personal' && <User className={`h-4 w-4 ${activeFilter === category ? 'text-white' : getCategoryColorClass(category as GoalCategory, 'primary')}`} />}
            </button>
          ))}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'completed')}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value="all">{t('progressPage.analytics.allGoals')}</option>
            <option value="active">{t('progressPage.analytics.active')}</option>
            <option value="completed">{t('progressPage.analytics.completed')}</option>
          </select>
        </div>

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
                    <span
                      className="text-sm"
                      style={{
                        color: categoryColors[category as GoalCategory]?.text
                      }}
                    >
                      {t('progressPage.analytics.goalCount', { count: goalsInCategory.length })}
                    </span>
                  </div>
                  <div className="space-y-2">
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
          <p className="text-gray-500">{t('progressPage.analytics.noGoalsFound')}</p>
        )}
      </div>
    </div>
  );
};

export default ProgressPage;