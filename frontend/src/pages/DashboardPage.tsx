import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../contexts/auth.context';
import type { AuthContextType } from '../contexts/auth.types';
import { useNavigate } from 'react-router-dom';
import { useTasks } from '../hooks/useTasks';
import { useGoals } from '../hooks/useGoals';
import QuoteOfDay from '../components/dashboard/QuoteOfDay';
import { Greeting } from '../components/dashboard/Greetings';
import TaskStatus from '../components/dashboard/TaskStatus';
import OverviewStats from '../components/dashboard/OverviewStats';
import type { Task } from '../types/tasks';
import type { Goal } from '../types/goals';

export default function DashboardPage() {
  const { t } = useTranslation();
  const { isAuthenticated, userName } = useContext(AuthContext) as AuthContextType;
  
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const navigate = useNavigate();

  // React Query: fetch data needed for dashboard
  const todayTasksQuery = useTasks({ filter: 'today' });
  const activeGoalsQuery = useGoals({ status: 'active' });
  const allGoalsQuery = useGoals({});
  const allTasksQuery = useTasks({});

  const todayTasks: Task[] = todayTasksQuery.data ?? [];
  const activeGoals: Goal[] = activeGoalsQuery.data ?? [];
  const allGoals: Goal[] = allGoalsQuery.data ?? [];
  const allTasks: Task[] = allTasksQuery.data ?? [];

  // Calculate stats for OverviewStats
  const totalGoals = allGoals.length || 0;
  const completedGoals = allGoals.filter(g => !!g.completed_at).length || 0;
  const inProgressGoals = totalGoals - completedGoals;
  const allTasksCount = allTasks.length || 0;
  const completedTasksCount = allTasks.filter(t => t.status === 'completed').length || 0;
  const avgProgress = allTasksCount > 0
    ? Math.round((completedTasksCount / allTasksCount) * 100)
    : 0;

  // The ProtectedRoute component in App.tsx already handles redirection if not authenticated.
  // This check provides an additional layer or can be page-specific for loading.
  if (isAuthenticated === false) {
    // This navigation might be redundant if ProtectedRoute always catches it first.
    // Consider if navigation here is still needed or if a simple null/message is better.
    navigate('/auth', { replace: true });
    return null;
  }

  if (isAuthenticated === null) {
    // Display a loading message while authentication status is being determined
    return <div className="p-6">{t('feedback.info.loadingDashboard')}</div>;
  }

  // Combined loading state
  const isLoading = todayTasksQuery.isLoading || activeGoalsQuery.isLoading || allGoalsQuery.isLoading || allTasksQuery.isLoading;

  return (
    <div className="space-y-6 md:p-4">
      {/* Fixed top bar */}
      <div className={`fixed top-0 left-0 right-0 z-50 bg-surface h-20 flex flex-col justify-center items-center ${isScrolled ? 'shadow-md' : ''}`}>
        <h1 className="text-xl font-semibold">{t('content.dashboard.title')}</h1>
        <p className="text-sm text-muted">{t('content.dashboard.subtitle')}</p>
      </div>
      
      {/* Content with top padding to account for fixed header */}
      <div className="pt-14 justify-center grid grid-cols-1 gap-4">
        <Greeting userName={userName} />
        <QuoteOfDay />
        {isLoading ? (
          <div className="p-4 text-center">{t('actions.loading')}</div>
        ) : (
          <TaskStatus todayTasks={todayTasks} activeGoals={activeGoals} />
        )}
        <hr className="w-full h-px border-standard mx-auto mt-6 mb-4 border-1" />
        <OverviewStats
          totalGoals={totalGoals}
          completedGoals={completedGoals}
          inProgressGoals={inProgressGoals}
          avgProgress={avgProgress}
        />
      </div>
    </div>
  );
}