import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useToast } from '../../hooks/useToast';
import type { Task } from '../../types/tasks';
import type { Goal } from '../../types/goals';
import { useGoals } from '../../hooks/useGoals';
import { Button } from '../ui/button';
import {
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Form,
  FormField,
  FormLabel,
  FormInput,
} from '@/components/ui/form';
import SelectMenu from '@/components/ui/select-menu';

interface TaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Task, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  initialTask?: Task;
}

const TaskDialog: React.FC<TaskDialogProps> = ({ isOpen, onClose, onSubmit, initialTask }) => {
  const { t } = useTranslation();
  const { error: toastError } = useToast();
  const [title, setTitle] = useState(initialTask?.title || '');
  const [goalId, setGoalId] = useState(initialTask?.goal_id || '');
  // Fetch goals via React Query (no imperative loop). We may fetch always; cost is low and avoids unstable deps.
  const goalsQuery = useGoals({ status: 'active' });
  const goals: Goal[] = goalsQuery.data ?? [];
  const isLoadingGoals = goalsQuery.isLoading;

  // Report fetch error via toast if it occurs
  useEffect(() => {
    if (goalsQuery.isError) {
      toastError('toast.error.taskDialog.fetchGoals');
    }
  }, [goalsQuery.isError, toastError]);

  useEffect(() => {
    if (isOpen) {
      setTitle(initialTask?.title || '');
      setGoalId(initialTask?.goal_id || '');
    }
  }, [isOpen, initialTask]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !goalId) return;
    onSubmit({ title, goal_id: goalId, status: 'incomplete' });
    onClose(); // Close dialog on successful submission
  };

  if (!isOpen) return null;

  return (
    <DialogOverlay>
      <DialogContent 
        onClose={onClose} 
        className="shadow-xl max-w-md mx-auto bg-card"
      >
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="text-2xl font-bold mb-2 text-center sm:text-left">
            {initialTask ? t('component.taskDialog.editTitle') : t('component.taskDialog.createTitle')}
          </DialogTitle>
        </DialogHeader>
        <Form onSubmit={handleSubmit} className="space-y-2 p-4 pt-0">
          <FormField>
            <FormLabel htmlFor="title" className="block mb-1 text-left">
              {t('component.taskDialog.yourTask')}
            </FormLabel>
            <FormInput
              id="title"
              type="text"
              value={title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
              required
              placeholder={t('component.taskDialog.taskPlaceholder')}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-[var(--radius)] bg-card text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </FormField>
          <FormField>
            <FormLabel htmlFor="goalId" className="block mb-1 text-left">
              {t('component.taskDialog.associatedGoal')} <span className="text-red-500">*</span>
            </FormLabel>
            <div className={initialTask || isLoadingGoals ? 'opacity-60 pointer-events-none' : ''}>
              <SelectMenu
                variant="default"
                size="default"
                value={goalId}
                onChange={(v) => setGoalId(v)}
                items={goals.map((goal) => ({ value: goal.id, label: goal.title }))}
                placeholder={isLoadingGoals ? t('actions.loading') : t('component.taskDialog.selectGoal')}
                className="w-full"
              />
            </div>
            {initialTask && (
              <DialogDescription className="text-xs text-muted-foreground mt-1">
                {t('component.taskDialog.goalCannotChange')}
              </DialogDescription>
            )}
            {goalId && goals.find(g => g.id === goalId)?.description && (
              <DialogDescription className="text-xs text-muted-foreground mt-1 italic">
                {goals.find(g => g.id === goalId)?.description}
              </DialogDescription>
            )}
          </FormField>
          <DialogFooter className="flex flex-row justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              {t('actions.cancel')}
            </Button>
            <Button type="submit" disabled={!title || !goalId}>
              {initialTask ? t('component.taskDialog.updateButton') : t('component.taskDialog.createButton')}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </DialogOverlay>
  );
};

export default TaskDialog;