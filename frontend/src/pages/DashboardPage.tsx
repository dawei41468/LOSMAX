import { useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../contexts/auth.context';
import type { AuthContextType } from '../contexts/auth.types';
import { useNavigate } from 'react-router-dom';
import { useTasks } from '../hooks/useTasks';
import { useGoals } from '../hooks/useGoals';
import QuoteOfDay from '@/components/dashboard/QuoteOfDay';
import { Greeting } from '@/components/dashboard/Greetings';
import TaskStatus from '@/components/dashboard/TaskStatus';
import OverviewStats from '@/components/dashboard/OverviewStats';
import type { Task } from '../types/tasks';
import type { Goal } from '../types/goals';
import AppShell from '@/layouts/AppShell';

export default function DashboardPage() {
  const { t } = useTranslation();
  const { isAuthenticated, userName } = useContext(AuthContext) as AuthContextType;

  useEffect(() => {
    window.scrollTo(0, 0);
    // No custom header scroll effects; AppShell manages top bar
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
    <AppShell
      title={t('content.dashboard.title')}
      subtitle={t('content.dashboard.subtitle')}
      showBottomNav={true}
    >
      <div className="pt-[calc(var(--app-header-h)-2.25rem)]">
        <div className="space-y-4">
          <div className="flex justify-center text-center">
            <Greeting userName={userName} />
          </div>
          <QuoteOfDay />
          {isLoading ? (
            <div className="p-4 text-center">{t('actions.loading')}</div>
          ) : (
            <TaskStatus todayTasks={todayTasks} activeGoals={activeGoals} />
          )}
          <hr className="w-full h-px border-standard mx-auto mt-6 mb-4" />
          <div className="flex justify-center text-center">
            <OverviewStats
              totalGoals={totalGoals}
              completedGoals={completedGoals}
              inProgressGoals={inProgressGoals}
              avgProgress={avgProgress}
            />
          </div>
        </div>
      </div>
    </AppShell>
  );
}