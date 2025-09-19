import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../contexts/auth.context';
import type { AuthContextType } from '../contexts/auth.types';
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask, useToggleTaskStatus } from '../hooks/useTasks';
import { useGoals } from '../hooks/useGoals';
import { CategoryHeader } from '@/components/ui/CategoryUI';
import { getCategoryColorClass } from '@/components/ui/categoryUtils';
import type { GoalCategory } from '../types/goals';
import type { Task } from '../types/tasks';
import type { Goal } from '../types/goals';
import { useNavigate } from 'react-router-dom';
import TaskDialog from '../components/tasks/TaskDialog';
import TaskCard from '../components/tasks/TaskCard';
import ConfirmDeleteDialog from '@/components/ui/ConfirmDeleteDialog';
import { useToast } from '../hooks/useToast'; // Import useToast hook
import SelectMenu from '@/components/ui/select-menu';
import { Button } from '@/components/ui/button';
import AppShell from '@/layouts/AppShell';

type FilterType = 'today' | 'all';

export default function TasksPage() {
  const { t } = useTranslation();
  const { isAuthenticated } = useContext(AuthContext) as AuthContextType;
  const navigate = useNavigate();
  const { error: toastError } = useToast();
  const [isLoading, setIsLoading] = useState(false); // UI-only loading for dialog/delete/toggle
  const [currentFilter, setCurrentFilter] = useState<FilterType>('today');
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  // React Query data
  const tasksQuery = useTasks({ filter: currentFilter });
  const tasks: Task[] = tasksQuery.data ?? [];
  const tasksLoading = tasksQuery.isLoading;
  const goalsQuery = useGoals({ status: 'active' });
  const goals: Goal[] = goalsQuery.data ?? [];
  const goalsLoading = goalsQuery.isLoading;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, navigate]);

  // Scroll to top on page load
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Mutations
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();
  const toggleTaskStatusMutation = useToggleTaskStatus();

  const handleDialogSubmit = async (data: Omit<Task, 'id' | 'user_id' | 'created_at'>) => {
    setIsLoading(true);
    try {
      if (editingTask) {
        await updateTaskMutation.mutateAsync({ id: editingTask.id, data: { title: data.title } });
      } else {
        await createTaskMutation.mutateAsync({ title: data.title, goal_id: data.goal_id });
      }
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
      await deleteTaskMutation.mutateAsync(taskToDelete);
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
    try {
      await toggleTaskStatusMutation.mutateAsync({ id: task.id, currentStatus: task.status });
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
    <AppShell
      title={t('content.tasks.dailyTasks')}
      subtitle={t('content.tasks.subtitle')}
      showBottomNav={true}
    >
      {/* Fixed filter/action row below AppShell header */}
      <div className="fixed left-0 right-0 top-[var(--app-header-h)] z-40 bg-surface py-2 px-app-content">
        <div className="flex items-center justify-between">
          <div className="flex justify-start">
            <SelectMenu
              variant="default"
              size="sm"
              value={currentFilter}
              onChange={(v) => setCurrentFilter(v as FilterType)}
              items={(['today', 'all'] as FilterType[]).map((filter) => ({ value: filter, label: t(`common.filter.${filter}`) }))}
              placeholder={t('common.filter.all')}
              className="min-w-[120px]"
            />
          </div>
          <Button onClick={openCreateDialog} size="sm">
            {t('content.tasks.createNew')}
          </Button>
        </div>
      </div>

      {/* Spacer to offset fixed filter bar height */}
      <div className="h-12" />

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

      {(tasksLoading || goalsLoading || isLoading) && <p className="text-center py-4">{t('actions.loading')}</p>}
      {!tasksLoading && !goalsLoading && !isLoading && tasks.length === 0 && (
        <p className="text-center py-4 text-gray-500 text-xl">
          {currentFilter === 'today' ? (
            <em>{t('toast.info.noTasksToday')}</em>
          ) : (
            t('toast.info.noTasksFound', { filter: t(`content.tasks.filters.${currentFilter}`) })
          )}
        </p>
      )}

      {Object.keys(groupedTasksByCategory).length > 0 && !tasksLoading && !goalsLoading && !isLoading && (
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
    </AppShell>
  );
}