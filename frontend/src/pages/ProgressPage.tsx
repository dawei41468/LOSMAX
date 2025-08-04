import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../contexts/auth.context';
import type { AuthContextType } from '../contexts/auth.types';
import { getGoals, getTasks } from '../services/api';
import type { GoalCategory, Goal } from '../types/goals';
import type { Task } from '../services/api';
import { CategoryHeader, getCategoryColorClass, categoryColors } from '../components/ui/CategoryUI';
import { toast } from 'sonner';
import ProgressGoalCard from '../components/progress/ProgressGoalCard';
import { Home, HeartPulse, Briefcase, User } from 'lucide-react';
import { Select, SelectItem } from '@/components/ui/select';

const ProgressPage: React.FC = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useContext(AuthContext) as AuthContextType;
  
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
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
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchProgressData();
  }, [fetchProgressData]);


  const convertToGoalProgress = (goal: Goal, tasks: Task[]) => {
    const goalTasks = tasks.filter(task => task.goal_id === goal.id);
    const completedTasks = goalTasks.filter(task => task.status === 'complete').length; // Use string literal for TaskStatus
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
    <div className="no-scrollbar md:p-4" style={{ overflowY: 'auto' }}>
      {/* Fixed top bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background h-20 flex flex-col justify-center items-center" style={{ backgroundColor: 'var(--background)' }}>
        <h1 className="text-xl font-semibold">{t('content.progress.title')}</h1>
        <p className="text-sm text-muted">{t('content.progress.subtitle')}</p>
      </div>
      
      {/* Fixed Action Bar beneath Top Bar */}
      <div className="fixed top-20 left-0 right-0 z-40 bg-background flex flex-row justify-between items-center px-6 py-2" style={{ backgroundColor: 'var(--background)' }}>
        <div className="flex justify-start">
          <Select
            variant="subtle"
            size="sm"
            value={statusFilter}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value as 'all' | 'active' | 'completed')}
            className="min-w-[120px]"
          >
            <SelectItem value="all">{t('common.filter.all')}</SelectItem>
            <SelectItem value="active">{t('common.filter.active')}</SelectItem>
            <SelectItem value="completed">{t('common.filter.completed')}</SelectItem>
          </Select>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            className={`px-2 py-1 rounded-full text-sm ${activeFilter === 'all' ? 'bg-gray-200' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            {t('common.filter.all')}
          </button>
          {(["Family", "Work", "Health", "Personal"] as GoalCategory[]).map(category => (
            <button
              key={category}
              className={`p-1.5 rounded-full ${activeFilter === category ? categoryColors[category as GoalCategory]?.primaryBg : ''}`}
              style={{}}
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
      
      {/* Main content area with padding for fixed header and action bar */}
      <div className="pt-24">
        {/* Goals Analytics Section */}
      <div>
        <div className="mb-2"></div>

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
                      {t('content.progress.goalCount', { count: goalsInCategory.length })}
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
          <p className="text-gray-500">{t('feedback.info.noGoalsFound')}</p>
        )}
      </div>
    </div>
  </div>
  );
};

export default ProgressPage;