import { useState, useEffect, useContext, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../contexts/auth.context';
import type { AuthContextType } from '../contexts/auth.types';
import { createTask, getTasks, updateTask, deleteTask, getGoals } from '../services/api';
import { CategoryHeader, getCategoryColorClass } from '../components/ui/CategoryUI';
import type { GoalCategory } from '../types/goals';
import type { Task } from '../services/api';
import type { Goal } from '../types/goals';
import { useNavigate } from 'react-router-dom';
import TaskDialog from '../components/tasks/TaskDialog';
import TaskCard from '../components/tasks/TaskCard';
import ConfirmDeleteDialog from '../components/ui/ConfirmDeleteDialog';
import { toast } from 'sonner'; // Import toast from sonner

type FilterType = 'today' | 'all';

export default function TasksPage() {
  const { t } = useTranslation();
  const { isAuthenticated } = useContext(AuthContext) as AuthContextType;
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentFilter, setCurrentFilter] = useState<FilterType>('today');
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  const fetchUserTasks = useCallback(async (filter: FilterType) => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const fetchedTasks = await getTasks(undefined, filter);
      const fetchedGoals = await getGoals('active');
      setTasks(fetchedTasks);
      setGoals(fetchedGoals);
    } catch (err: unknown) {
      console.error('Failed to fetch tasks or goals:', err);
      let errorMessage = 'Failed to load tasks or goals.';
      if (err instanceof Error) {
        errorMessage = err.message;
        if (err.message.includes('404')) {
          setTasks([]); // Set tasks to empty array to show "no tasks found" message
        }
      } else if (typeof err === 'object' && err !== null && 'detail' in err && typeof (err as { detail: string }).detail === 'string') {
        errorMessage = (err as { detail: string }).detail;
      }
      toast.error(t('tasks.error_message', { error: errorMessage }));
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, t]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
    } else {
      fetchUserTasks(currentFilter);
    }
  }, [isAuthenticated, navigate, currentFilter, fetchUserTasks]);

  const handleDialogSubmit = async (data: Omit<Task, 'id' | 'user_id' | 'created_at'>) => {
    setIsLoading(true);
    try {
      if (editingTask) {
        await updateTask(editingTask.id, { title: data.title });
      } else {
        await createTask({ title: data.title, goal_id: data.goal_id });
      }
      fetchUserTasks(currentFilter); // Refetch tasks
    } catch (err: unknown) {
      console.error('Failed to save task:', err);
      let errorMessage = 'Failed to save task.';
      if (err instanceof Error) {
        errorMessage = err.message;
        if (err.message.includes('404')) {
          errorMessage = 'Task creation is currently unavailable. Please try again later.';
        }
      } else if (typeof err === 'object' && err !== null && 'detail' in err && typeof (err as { detail: string }).detail === 'string') {
        errorMessage = (err as { detail: string }).detail;
      }
      toast.error(t('tasks.error_message', { error: errorMessage }));
    } finally {
      setIsLoading(false);
      setIsTaskDialogOpen(false);
      setEditingTask(null);
    }
  };

  const openCreateDialog = () => {
    setEditingTask(null);
    setIsTaskDialogOpen(true);
  };

  const openEditDialog = (task: Task) => {
    if (task.id) {
      setEditingTask(task);
      setIsTaskDialogOpen(true);
    } else {
      toast.error(t('tasks.error_message', { error: "Cannot edit task without a valid ID." }));
    }
  };

  const confirmDeleteTask = (taskId: string) => {
    if (taskId) {
      setTaskToDelete(taskId);
      setShowDeleteConfirm(true);
    } else {
      toast.error(t('tasks.error_message', { error: "Cannot delete task without a valid ID." }));
    }
  };

  const handleDeleteTask = async () => {
    if (!taskToDelete) return;

    setIsLoading(true);
    try {
      await deleteTask(taskToDelete);
      fetchUserTasks(currentFilter); // Refetch tasks
    } catch (err: unknown) {
      console.error('Failed to delete task:', err);
      let errorMessage = 'Failed to delete task.';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null && 'detail' in err && typeof (err as { detail: string }).detail === 'string') {
        errorMessage = (err as { detail: string }).detail;
      }
      toast.error(t('tasks.error_message', { error: errorMessage }));
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
      setTaskToDelete(null);
    }
  };

  const handleToggleStatus = async (task: Task) => {
    if (!task.id) {
      toast.error(t('tasks.error_message', { error: "Cannot update status of task without a valid ID." }));
      return;
    }
    setIsLoading(true);
    const newStatus = task.status === 'complete' ? 'incomplete' : 'complete';
    try {
      const updatedTask = await updateTask(task.id, { status: newStatus });
      setTasks(prevTasks => prevTasks.map(t => t.id === updatedTask.id ? updatedTask : t));
    } catch (err: unknown) {
      console.error('Failed to update task status:', err);
      let errorMessage = 'Failed to update task status.';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null && 'detail' in err && typeof (err as { detail: string }).detail === 'string') {
        errorMessage = (err as { detail: string }).detail;
      }
      toast.error(t('tasks.error_message', { error: errorMessage }));
    } finally {
      setIsLoading(false);
    }
  };

  // Group tasks by category first (derived from associated goal), then by goal
  const groupedTasksByCategory = tasks.reduce((acc, task) => {
    const associatedGoal = goals.find(goal => goal.id === task.goal_id);
    const category = associatedGoal ? associatedGoal.category : 'Uncategorized';
    if (!acc[category]) {
      acc[category] = {};
    }
    if (!acc[category][task.goal_id]) {
      acc[category][task.goal_id] = [];
    }
    acc[category][task.goal_id].push(task);
    return acc;
  }, {} as Record<string, Record<string, Task[]>>);

  return (
    <div className="py-6 no-scrollbar md:p-4" style={{ overflowY: 'auto' }}>
      {/* Header Section */}
      <div className="px-4 flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
        <button
          onClick={openCreateDialog}
          className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none"
        >
          {t('tasks.create_new')}
        </button>
      </div>

      {/* Filter Buttons */}
      <div className="px-4 mb-6 flex flex-wrap gap-2 justify-center">
        {(['today', 'all'] as FilterType[]).map(filter => (
          <button
            key={filter}
            onClick={() => setCurrentFilter(filter)}
            className={`px-3 py-1.5 text-xs rounded-md transition-colors sm:px-4 sm:py-2 sm:text-sm ${currentFilter === filter ? 'border border-blue-600 text-blue-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {t(`tasks.filters.${filter}`)}
          </button>
        ))}
      </div>

      {isTaskDialogOpen && (
        <TaskDialog
          isOpen={isTaskDialogOpen}
          onClose={() => {
            setIsTaskDialogOpen(false);
            setEditingTask(null);
          }}
          onSubmit={handleDialogSubmit}
          initialTask={editingTask || undefined}
        />
      )}

      <ConfirmDeleteDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteTask}
        itemName="Task"
        isDeleting={isLoading}
      />

      {isLoading && <p className="text-center py-4">{t('common.loading')}</p>}
      {!isLoading && tasks.length === 0 && (
        <p className="text-center py-4 text-gray-500 text-xl">
          {currentFilter === 'today' ? (
            <em>{t('tasks.no_tasks_found_today')}</em>
          ) : (
            t('tasks.no_tasks_found', { filter: t(`tasks.filters.${currentFilter}`) })
          )}
        </p>
      )}

      {Object.keys(groupedTasksByCategory).length > 0 && !isLoading && (
        (['Family', 'Work', 'Health', 'Personal'] as GoalCategory[])
          .filter(category => groupedTasksByCategory[category] && Object.keys(groupedTasksByCategory[category]).length > 0)
          .map(category => (
            <div key={category} className="mb-6">
              <h2 className="text-xl font-semibold mb-3 flex items-center">
                <CategoryHeader category={category as GoalCategory} />
              </h2>
              {Object.entries(groupedTasksByCategory[category]).map(([goalId, tasksInGoal]) => (
                <div key={goalId} className="mb-4">
                  <h3 className={`text-lg font-medium mb-2 text-left ${getCategoryColorClass(goals.find(g => g.id === goalId)?.category as GoalCategory || 'Work', 'primary')}`}>
                    {goals.find(g => g.id === goalId)?.title || t('tasks.uncategorized')}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tasksInGoal.map((task, index) => (
                      <TaskCard
                        key={task.id || `task-${index}`}
                        task={task}
                        onEdit={openEditDialog}
                        onDelete={() => confirmDeleteTask(task.id)}
                        onToggleStatus={handleToggleStatus}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))
      )}
    </div>
  );
}