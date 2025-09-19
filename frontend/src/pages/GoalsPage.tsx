import { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../contexts/auth.context';
import type { AuthContextType } from '../contexts/auth.types';
import { useGoals, useCreateGoal, useUpdateGoal, useDeleteGoal, useToggleGoalStatus } from '../hooks/useGoals';
import { CategoryHeader } from '@/components/ui/CategoryUI';
import { useNavigate } from 'react-router-dom';
import type { Goal, GoalStatus, GoalCategory, CreateGoalPayload } from '../types/goals';
import GoalDialog from '../components/goals/GoalDialog';
import GoalCard from '../components/goals/GoalCard';
import ConfirmDeleteDialog from '@/components/ui/ConfirmDeleteDialog'; // Import the new dialog
import { useToast } from '../hooks/useToast'; // Import useToast hook
import SelectMenu from '@/components/ui/select-menu';
import { Button } from '@/components/ui/button';
import AppShell from '@/layouts/AppShell';

// CATEGORIES_PAGE_LEVEL removed as GoalDialog defines its own or it should come from a shared constant

type FilterStatus = GoalStatus | 'all';

export default function GoalsPage() {
  const { t } = useTranslation();
  const { isAuthenticated } = useContext(AuthContext) as AuthContextType;
  const { error: toastError } = useToast();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false); // UI-only loading (dialogs, deletes)
  const [currentFilter, setCurrentFilter] = useState<FilterStatus>('active');
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); // State for delete confirmation dialog
  const [goalToDelete, setGoalToDelete] = useState<string | null>(null); // State to store the ID of the goal to delete

  // React Query: goals query based on current filter
  const goalsQuery = useGoals({ status: currentFilter === 'all' ? undefined : (currentFilter as GoalStatus) });
  const goals: Goal[] = goalsQuery.data ?? [];
  const goalsLoading = goalsQuery.isLoading;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, navigate]);


  // Mutations
  const createGoalMutation = useCreateGoal();
  const updateGoalMutation = useUpdateGoal();
  const deleteGoalMutation = useDeleteGoal();
  const toggleGoalStatusMutation = useToggleGoalStatus();

  const handleDialogSubmit = async (data: Omit<Goal, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'days_remaining' | 'completed_at'>) => {
    setIsLoading(true);
    try {
      if (editingGoal) {
        // Ensure target_date is in the correct string format if it's a Date object
        const payload: Partial<Omit<Goal, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'days_remaining'>> = {
          ...data,
          target_date: typeof data.target_date === 'string' ? data.target_date : new Date(data.target_date).toISOString().split('T')[0],
        };
        await updateGoalMutation.mutateAsync({ id: editingGoal.id, data: payload });
      } else {
        const payload: CreateGoalPayload = {
          ...data,
          target_date: typeof data.target_date === 'string' ? data.target_date : new Date(data.target_date).toISOString().split('T')[0],
          category: data.category as GoalCategory, // Ensure category is GoalCategory
        };
        await createGoalMutation.mutateAsync(payload);
      }
    } catch (err: unknown) {
      console.error('Failed to save goal:', err);
      let errorMessage = t('toast.error.generic');
       if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null && 'detail' in err && typeof (err as { detail: string }).detail === 'string') {
        errorMessage = (err as { detail: string }).detail;
      }
      toastError(errorMessage);
    } finally {
      setIsLoading(false);
      setIsGoalDialogOpen(false);
      setEditingGoal(null);
    }
  };

  const openCreateDialog = () => {
    setEditingGoal(null);
    setIsGoalDialogOpen(true);
  };

  const openEditDialog = (goal: Goal) => {
    setEditingGoal(goal);
    setIsGoalDialogOpen(true);
  };

  const confirmDeleteGoal = (goalId: string) => {
    setGoalToDelete(goalId);
    setShowDeleteConfirm(true);
  };

  const handleDeleteGoal = async () => {
    if (!goalToDelete) return;

    setIsLoading(true);
    try {
      await deleteGoalMutation.mutateAsync(goalToDelete);
    } catch (err: unknown) {
      console.error('Failed to delete goal:', err);
      let errorMessage = t('toast.error.generic');
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null && 'detail' in err && typeof (err as { detail: string }).detail === 'string') {
        errorMessage = (err as { detail: string }).detail;
      }
      toastError(errorMessage);
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false); // Close the confirmation dialog
      setGoalToDelete(null); // Clear the goal to delete
    }
  };

  const handleToggleStatus = async (goal: Goal) => {
    setIsLoading(true);
    try {
      await toggleGoalStatusMutation.mutateAsync({ id: goal.id, currentStatus: goal.status as GoalStatus });
    } catch (err: unknown) {
      console.error('Failed to update goal status:', err);
      let errorMessage = t('toast.error.generic');
       if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null && 'detail' in err && typeof (err as { detail: string }).detail === 'string') {
        errorMessage = (err as { detail: string }).detail;
      }
      toastError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const groupedGoals = goals.reduce((acc, goal) => {
    (acc[goal.category as GoalCategory] = acc[goal.category as GoalCategory] || []).push(goal);
    return acc;
  }, {} as Record<GoalCategory, Goal[]>);


  return (
    <AppShell
      title={t('content.goals.title')}
      subtitle={t('content.goals.subtitle')}
      showBottomNav={false}
    >
      <div className="space-y-4">
        {/* Actions row (fixed below AppShell header) */}
        <div className="fixed left-0 right-0 top-[var(--app-header-h)] z-40 bg-surface py-2 px-app-content">
          <div className="flex items-center justify-between">
          <div className="flex justify-start">
            <SelectMenu
              variant="default"
              size="sm"
              value={currentFilter}
              onChange={(v) => setCurrentFilter(v as FilterStatus)}
              items={[
                { value: 'active', label: t('common.filter.active') },
                { value: 'completed', label: t('common.filter.completed') },
                { value: 'all', label: t('common.filter.all') },
              ]}
              placeholder={t('common.filter.all')}
              className="min-w-[120px]"
            />
          </div>
          <Button onClick={openCreateDialog} size="sm">
            {t('content.goals.createNew')}
          </Button>
          </div>
        </div>
        {/* Spacer to offset fixed filter bar height */}
        <div className="h-12" />

        {isGoalDialogOpen && (
          <GoalDialog
            isOpen={isGoalDialogOpen}
            onClose={() => {
              setIsGoalDialogOpen(false);
              setEditingGoal(null);
            }}
            onSubmit={handleDialogSubmit}
            initialGoal={editingGoal || undefined}
          />
        )}

        <ConfirmDeleteDialog
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={handleDeleteGoal}
          itemName="goal"
          isDeleting={isLoading}
        />

        {(goalsLoading || isLoading) && <p className="text-center py-4">{t('actions.loading')}</p>}
        {!goalsLoading && !isLoading && goals.length === 0 && (
          <p className="text-center py-4 text-gray-500 text-xl">
            {t('toast.info.noGoalsFound', { filter: t(`content.goals.filters.${currentFilter}`) })}
          </p>
        )}

        {Object.keys(groupedGoals).length > 0 && !goalsLoading && !isLoading && (
          (['Family', 'Work', 'Health', 'Personal'] as GoalCategory[])
            .filter(category => groupedGoals[category] && groupedGoals[category].length > 0)
            .map(category => (
              <div key={category} className="mb-6">
                <h2 className="text-xl font-semibold mb-3 flex items-center">
                  <CategoryHeader category={category} />
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {groupedGoals[category].map(goal => (
                    <GoalCard
                      key={goal.id}
                      goal={goal}
                      onEdit={openEditDialog}
                      onDelete={() => confirmDeleteGoal(goal.id)}
                      onToggleStatus={handleToggleStatus}
                    />
                  ))}
                </div>
              </div>
            ))
        )}
      </div>
    </AppShell>
  );
}