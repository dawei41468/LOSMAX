import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../contexts/auth.context';
import type { AuthContextType } from '../contexts/auth.types';
import { createTask, getTasks, updateTask, deleteTask, getGoals } from '../services/api';
import { CategoryHeader } from '../components/ui/CategoryUI';
import { getCategoryColorClass } from '../components/ui/categoryUtils';
import type { GoalCategory } from '../types/goals';
import type { Task } from '../types/tasks';
import type { Goal } from '../types/goals';
import { useNavigate } from 'react-router-dom';
import TaskDialog from '../components/tasks/TaskDialog';
import TaskCard from '../components/tasks/TaskCard';
import ConfirmDeleteDialog from '../components/ui/ConfirmDeleteDialog';
import { useToast } from '../hooks/useToast'; // Import useToast hook
import { Select, SelectItem } from '@/components/ui/select';

type FilterType = 'today' | 'all';

export default function TasksPage() {
  const { t } = useTranslation();
  const { isAuthenticated } = useContext(AuthContext) as AuthContextType;
  const navigate = useNavigate();
  const { error: toastError } = useToast();
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
      let errorMessage = t('toast.error.task.fetchTasks');
      if (err instanceof Error) {
        errorMessage = err.message;
        if (err.message.includes('404')) {
          setTasks([]); // Set tasks to empty array to show "no tasks found" message
        }
      } else if (typeof err === 'object' && err !== null && 'detail' in err && typeof (err as { detail: string }).detail === 'string') {
        errorMessage = (err as { detail: string }).detail;
      }
      toastError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, t]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
    } else {
      fetchUserTasks(currentFilter);
    }
  }, [isAuthenticated, navigate, currentFilter, fetchUserTasks]);

  // Scroll to top on page load
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
      let errorMessage = t('toast.error.task.saveTask');
      if (err instanceof Error) {
        errorMessage = err.message;
        if (err.message.includes('404')) {
          errorMessage = t('toast.error.task.taskCreationUnavailable');
        }
      } else if (typeof err === 'object' && err !== null && 'detail' in err && typeof (err as { detail: string }).detail === 'string') {
        errorMessage = (err as { detail: string }).detail;
      }
      toastError(errorMessage);
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
      toastError('toast.error.generic');
    }
  };

  const confirmDeleteTask = (taskId: string) => {
    if (taskId) {
      setTaskToDelete(taskId);
      setShowDeleteConfirm(true);
    } else {
      toastError('toast.error.generic');
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
      let errorMessage = t('toast.error.task.deleteTask');
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null && 'detail' in err && typeof (err as { detail: string }).detail === 'string') {
        errorMessage = (err as { detail: string }).detail;
      }
      toastError(errorMessage);
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
      setTaskToDelete(null);
    }
  };

  const handleToggleStatus = async (task: Task) => {
    if (!task.id) {
      toastError('toast.error.generic');
      return;
    }
    setIsLoading(true);
    const newStatus = task.status === 'completed' ? 'incomplete' : 'completed';
    try {
      const updatedTask = await updateTask(task.id, { status: newStatus });
      setTasks(prevTasks => prevTasks.map(t => t.id === updatedTask.id ? updatedTask : t));
    } catch (err: unknown) {
      console.error('Failed to update task status:', err);
      let errorMessage = t('toast.error.task.updateTask');
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
  }, {} as Record<GoalCategory | 'Uncategorized', Record<string, Task[]>>);

  return (
    <div className="no-scrollbar md:p-4" style={{ overflowY: 'auto' }}>
      {/* Fixed top bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-background h-20 flex flex-col justify-center items-center" style={{ backgroundColor: 'var(--background)' }}>
        <h1 className="text-xl font-semibold">{t('content.tasks.dailyTasks')}</h1>
        <p className="text-sm text-muted">{t('content.tasks.subtitle')}</p>
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
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCurrentFilter(e.target.value as FilterType)}
              className="min-w-[120px] focus:ring-0 focus:outline-none"
              style={{ borderColor: '#374151', outline: 'none', boxShadow: 'none' }}
            >
              {(['today', 'all'] as FilterType[]).map(filter => (
                <SelectItem key={filter} value={filter}>
                  {t(`common.filter.${filter}`)}
                </SelectItem>
              ))}
            </Select>
          </div>
          <button
            onClick={openCreateDialog}
            className="w-auto px-4 py-2 text-sm font-medium border border-blue-500 text-blue-500 rounded-md hover:bg-blue-500/10 transition-colors focus:outline-none"
          >
            {t('content.tasks.createNew')}
          </button>
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

      {isLoading && <p className="text-center py-4">{t('actions.loading')}</p>}
      {!isLoading && tasks.length === 0 && (
        <p className="text-center py-4 text-gray-500 text-xl">
          {currentFilter === 'today' ? (
            <em>{t('toast.info.noTasksToday')}</em>
          ) : (
            t('toast.info.noTasksFound', { filter: t(`content.tasks.filters.${currentFilter}`) })
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
                    {goals.find(g => g.id === goalId)?.title || t('content.tasks.uncategorized')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
    </div>
  );
}