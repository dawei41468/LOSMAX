import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../contexts/auth.context';
import type { AuthContextType } from '../contexts/auth.types';
import { getGoals, getTasks } from '../services/api';
import type { GoalCategory, Goal } from '../types/goals';
import type { Task } from '../types/tasks';
import { CategoryHeader} from '../components/ui/CategoryUI';
import { getCategoryColorClass, categoryColors } from '../components/ui/categoryUtils';
import { useToast } from '../hooks/useToast';
import ProgressGoalCard from '../components/progress/ProgressGoalCard';
import { Home, HeartPulse, Briefcase, User } from 'lucide-react';
import { Select, SelectItem } from '@/components/ui/select';

const ProgressPage: React.FC = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useContext(AuthContext) as AuthContextType;
  const { error: toastError } = useToast();
  
  const [isScrolled, setIsScrolled] = useState(false);

  React.useEffect(() => {
    window.scrollTo(0, 0);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
      let errorMessage = 'toast.error.progressLoadFailed';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null && 'detail' in err && typeof (err as { detail: string }).detail === 'string') {
        errorMessage = (err as { detail: string }).detail;
      }
      toastError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  useEffect(() => {
    fetchProgressData();
  }, [fetchProgressData]);


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
    <div className="no-scrollbar md:p-4" style={{ overflowY: 'auto' }}>
      {/* Fixed top bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background h-20 flex flex-col justify-center items-center" style={{ backgroundColor: 'var(--surface)' }}>
        <h1 className="text-xl font-semibold">{t('content.progress.title')}</h1>
        <p className="text-sm text-muted">{t('content.progress.subtitle')}</p>
      </div>
      
      {/* Fixed Action Bar beneath Top Bar */}
      <div className={`fixed top-20 left-0 right-0 z-40 bg-background flex flex-row justify-between items-center px-6 py-2 ${isScrolled ? 'shadow-md' : ''}`} style={{ backgroundColor: 'var(--surface)' }}>
        <div className="flex justify-start">
          <Select
            variant="subtle"
            size="sm"
            value={statusFilter}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value as 'all' | 'active' | 'completed')}
            className="min-w-[120px] focus:ring-0 focus:outline-none"
            style={{ borderColor: '#374151', outline: 'none', boxShadow: 'none' }}
          >
            <SelectItem value="all">{t('common.filter.all')}</SelectItem>
            <SelectItem value="active">{t('common.filter.active')}</SelectItem>
            <SelectItem value="completed">{t('common.filter.completed')}</SelectItem>
          </Select>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            className={`px-2 py-1 rounded-full text-sm ${activeFilter === 'all' ? 'bg-secondary' : ''}`}
            style={activeFilter === 'all' ? { backgroundColor: 'var(--secondary)' } : {}}
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
    </div>
  </div>
  );
};

export default ProgressPage;