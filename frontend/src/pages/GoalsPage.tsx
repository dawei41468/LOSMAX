import { useState, useEffect, useContext, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../contexts/auth.context';
import type { AuthContextType } from '../contexts/auth.types';
import { createGoal, getGoals, updateGoal, deleteGoal } from '../services/api';
import { CategoryHeader } from '../components/ui/CategoryUI';
import { useNavigate } from 'react-router-dom';
import type { Goal, GoalStatus, GoalCategory, CreateGoalPayload } from '../types/goals';
import GoalDialog from '../components/goals/GoalDialog';
import GoalCard from '../components/goals/GoalCard';
import ConfirmDeleteDialog from '../components/ui/ConfirmDeleteDialog'; // Import the new dialog
import { useToast } from '../hooks/useToast'; // Import useToast hook
import { Select, SelectItem } from '@/components/ui/select';

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
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentFilter, setCurrentFilter] = useState<FilterStatus>('active');
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); // State for delete confirmation dialog
  const [goalToDelete, setGoalToDelete] = useState<string | null>(null); // State to store the ID of the goal to delete

  const fetchUserGoals = useCallback(async (filter: FilterStatus) => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const fetchedGoals = await getGoals(filter === 'all' ? undefined : filter);
      setGoals(fetchedGoals);
    } catch (err: unknown) {
      console.error('Failed to fetch goals:', err);
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
  }, [isAuthenticated, t]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
    } else {
      fetchUserGoals(currentFilter);
    }
  }, [isAuthenticated, navigate, currentFilter, fetchUserGoals]);


  const handleDialogSubmit = async (data: Omit<Goal, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'days_remaining' | 'completed_at'>) => {
    setIsLoading(true);
    try {
      if (editingGoal) {
        // Ensure target_date is in the correct string format if it's a Date object
        const payload: Partial<Omit<Goal, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'days_remaining'>> = {
          ...data,
          target_date: typeof data.target_date === 'string' ? data.target_date : new Date(data.target_date).toISOString().split('T')[0],
        };
        await updateGoal(editingGoal.id, payload);
      } else {
        const payload: CreateGoalPayload = {
          ...data,
          target_date: typeof data.target_date === 'string' ? data.target_date : new Date(data.target_date).toISOString().split('T')[0],
          category: data.category as GoalCategory, // Ensure category is GoalCategory
        };
        await createGoal(payload);
      }
      fetchUserGoals(currentFilter); // Refetch goals
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
      await deleteGoal(goalToDelete);
      fetchUserGoals(currentFilter); // Refetch goals
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
    const newStatus = goal.status === 'active' ? 'completed' : 'active';
    try {
      await updateGoal(goal.id, { status: newStatus });
      fetchUserGoals(currentFilter); // Refetch goals
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
    <div className="no-scrollbar md:p-4" style={{ overflowY: 'auto' }}>
      {/* Fixed top bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background h-20 flex flex-col justify-center items-center" style={{ backgroundColor: 'var(--background)' }}>
        <h1 className="text-xl font-semibold">{t('content.goals.title')}</h1>
        <p className="text-sm text-muted">{t('content.goals.subtitle')}</p>
      </div>
      
      {/* Content with top padding to account for fixed header */}
      <div className="pt-24">
        {/* Fixed Action Bar beneath Top Bar */}
        <div className="fixed top-20 left-0 right-0 z-40 bg-background flex flex-row justify-between items-center px-6 py-2" style={{ backgroundColor: 'var(--background)' }}>
          {/* Filter Select Menu */}
          <div className="flex justify-start">
            <Select
              variant="subtle"
              size="sm"
              value={currentFilter}
              onChange={(e) => setCurrentFilter(e.target.value as FilterStatus)}
              className="min-w-[120px] focus:ring-0 focus:outline-none"
              style={{ borderColor: '#374151', outline: 'none', boxShadow: 'none' }}
            >
              <SelectItem value="active">{t('common.filter.active')}</SelectItem>
              <SelectItem value="completed">{t('common.filter.completed')}</SelectItem>
              <SelectItem value="all">{t('common.filter.all')}</SelectItem>
            </Select>
          </div>
          <button
            onClick={openCreateDialog}
            className="w-auto px-4 py-2 text-sm font-medium border border-blue-500 text-blue-500 rounded-md hover:bg-blue-500/10 transition-colors focus:outline-none"
          >
            {t('content.goals.createNew')}
          </button>
        </div>

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

        {isLoading && <p className="text-center py-4">{t('actions.loading')}</p>}
        {!isLoading && goals.length === 0 && (
          <p className="text-center py-4 text-gray-500">
            {t('toast.info.noGoalsFound', { filter: t(`content.goals.filters.${currentFilter}`) })}
          </p>
        )}

        {Object.keys(groupedGoals).length > 0 && !isLoading && (
          (['Family', 'Work', 'Health', 'Personal'] as GoalCategory[])
            .filter(category => groupedGoals[category] && groupedGoals[category].length > 0)
            .map(category => (
              <div key={category} className="mb-6">
                <h2 className="text-xl font-semibold mb-3 flex items-center">
                  <CategoryHeader
                    category={category}
                  />
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
    </div>
);
}