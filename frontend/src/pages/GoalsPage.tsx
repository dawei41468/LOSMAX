import { useState, useEffect, useContext, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../contexts/auth.context';
import type { AuthContextType } from '../contexts/auth.types';
import { createGoal, getGoals, updateGoal, deleteGoal } from '../services/api';
import { CategoryHeader } from '../components/ui/CategoryUI';
import type { CreateGoalPayload } from '../services/api'; // Type-only import
import { useNavigate } from 'react-router-dom';
import type { Goal, GoalStatus, GoalCategory } from '../types/goals';
import GoalDialog from '../components/goals/GoalDialog';
import GoalCard from '../components/goals/GoalCard';
import ConfirmDeleteDialog from '../components/ui/ConfirmDeleteDialog'; // Import the new dialog
import { toast } from 'sonner'; // Import toast from sonner

// CATEGORIES_PAGE_LEVEL removed as GoalDialog defines its own or it should come from a shared constant

type FilterStatus = GoalStatus | 'all';

export default function GoalsPage() {
  const { t } = useTranslation();
  const { isAuthenticated } = useContext(AuthContext) as AuthContextType;
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
      let errorMessage = 'Failed to load goals.';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null && 'detail' in err && typeof (err as { detail: string }).detail === 'string') {
        errorMessage = (err as { detail: string }).detail;
      }
      toast.error(t('goals.error_message', { error: errorMessage }));
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
      let errorMessage = 'Failed to save goal.';
       if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null && 'detail' in err && typeof (err as { detail: string }).detail === 'string') {
        errorMessage = (err as { detail: string }).detail;
      }
      toast.error(t('goals.error_message', { error: errorMessage }));
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
      let errorMessage = 'Failed to delete goal.';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null && 'detail' in err && typeof (err as { detail: string }).detail === 'string') {
        errorMessage = (err as { detail: string }).detail;
      }
      toast.error(t('goals.error_message', { error: errorMessage }));
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
      let errorMessage = 'Failed to update goal status.';
       if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null && 'detail' in err && typeof (err as { detail: string }).detail === 'string') {
        errorMessage = (err as { detail: string }).detail;
      }
      toast.error(t('goals.error_message', { error: errorMessage }));
    } finally {
      setIsLoading(false);
    }
  };

  const groupedGoals = goals.reduce((acc, goal) => {
    (acc[goal.category as GoalCategory] = acc[goal.category as GoalCategory] || []).push(goal);
    return acc;
  }, {} as Record<GoalCategory, Goal[]>);


  return (
    <div className="py-6 no-scrollbar" style={{ overflowY: 'auto' }}> {/* Removed px-4, kept py-6 for vertical spacing */}
      {/* Header Section */}
      <div className="px-4 flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6"> {/* Added px-4 here */}
        <button
          onClick={openCreateDialog}
          className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none"
        >
          {t('goals.create_new')}
        </button>
      </div>

      {/* Filter Buttons */}
      <div className="px-4 mb-6 flex flex-wrap gap-2 justify-center"> {/* Added px-4 here, use flex-wrap and gap */}
        {(['active', 'completed', 'all'] as FilterStatus[]).map(filter => (
          <button
            key={filter}
            onClick={() => setCurrentFilter(filter)}
            className={`px-3 py-1.5 text-xs rounded-md transition-colors sm:px-4 sm:py-2 sm:text-sm ${currentFilter === filter ? 'border border-blue-600 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {t(`goals.filters.${filter}`)}
          </button>
        ))}
      </div>

      {isGoalDialogOpen && (
        <GoalDialog
          isOpen={isGoalDialogOpen}
          onClose={() => {
            setIsGoalDialogOpen(false);
            setEditingGoal(null);
          }}
          onSubmit={handleDialogSubmit}
          initialGoal={editingGoal || undefined} // Pass undefined if not editing
        />
      )}

      <ConfirmDeleteDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteGoal}
        itemName="goal"
        isDeleting={isLoading}
      />

      {isLoading && <p className="text-center py-4">{t('common.loading')}</p>}
      {!isLoading && goals.length === 0 && (
        <p className="text-center py-4 text-gray-500">
          {t('goals.no_goals_found', { filter: t(`goals.filters.${currentFilter}`) })}
        </p>
      )}

      {Object.keys(groupedGoals).length > 0 && !isLoading && (
        (['Family', 'Work', 'Health', 'Personal'] as GoalCategory[])
          .filter(category => groupedGoals[category] && groupedGoals[category].length > 0) // Filter out categories that have no goals
          .map(category => (
            <div key={category} className="mb-6">
              <h2 className="text-xl font-semibold mb-3 flex items-center">
                <CategoryHeader
                  category={category}
                />
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupedGoals[category].map(goal => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    onEdit={openEditDialog}
                    onDelete={() => confirmDeleteGoal(goal.id)} // Use confirmDeleteGoal
                    onToggleStatus={handleToggleStatus}
                  />
                ))}
              </div>
            </div>
          ))
      )}
    </div>
  );
}