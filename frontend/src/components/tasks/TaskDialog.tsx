import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../hooks/useToast';
import type { Task } from '../../types/tasks';
import type { Goal } from '../../types/goals';
import { getGoals } from '../../services/api';
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
import { SelectField } from '@/components/ui/select';

interface TaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Task, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  initialTask?: Task;
}

const TaskDialog: React.FC<TaskDialogProps> = ({ isOpen, onClose, onSubmit, initialTask }) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [title, setTitle] = useState(initialTask?.title || '');
  const [goalId, setGoalId] = useState(initialTask?.goal_id || '');
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoadingGoals, setIsLoadingGoals] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTitle(initialTask?.title || '');
      setGoalId(initialTask?.goal_id || '');
      fetchGoals();
    }
  }, [isOpen, initialTask]);

  const fetchGoals = async () => {
    setIsLoadingGoals(true);
    try {
      const fetchedGoals = await getGoals('active');
      setGoals(fetchedGoals);
    } catch (error) {
      console.error('Failed to fetch goals:', error);
      const { error: toastError } = useToast();
      toastError('toast.error.taskDialog.fetchGoals');
    } finally {
      setIsLoadingGoals(false);
    }
  };

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
        className="rounded-lg shadow-xl max-w-md mx-auto" 
        style={{ backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff' }}
      >
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="text-2xl font-bold mb-2 text-center sm:text-left">
            {initialTask ? t('component.taskDialog.editTitle') : t('component.taskDialog.createTitle')}
          </DialogTitle>
        </DialogHeader>
        <Form onSubmit={handleSubmit} className="space-y-2 p-4 pt-0">
          <FormField>
            <FormLabel htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1 text-left">
              {t('component.taskDialog.yourTask')}
            </FormLabel>
            <FormInput
              id="title"
              type="text"
              value={title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
              required
              placeholder={t('component.taskDialog.taskPlaceholder')}
              className="w-full p-2 border rounded-md"
            />
          </FormField>
          <FormField>
            <FormLabel htmlFor="goalId" className="block text-sm font-medium text-gray-700 mb-1 text-left">
              {t('component.taskDialog.associatedGoal')} <span className="text-red-500">*</span>
            </FormLabel>
            <SelectField
              id="goalId"
              value={goalId}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setGoalId(e.target.value)}
              required
              disabled={!!initialTask || isLoadingGoals}
              placeholder={isLoadingGoals ? t('actions.loading') : t('component.taskDialog.selectGoal')}
              className="w-full p-2 border rounded-md focus:ring-0 focus:outline-none"
              style={{ borderColor: '#374151', outline: 'none', boxShadow: 'none' }}
            >
              {goals.map(goal => (
                <option key={goal.id} value={goal.id}>
                  {goal.title}
                </option>
              ))}
            </SelectField>
            {initialTask && (
              <DialogDescription className="text-xs text-gray-500 mt-1">
                {t('component.taskDialog.goalCannotChange')}
              </DialogDescription>
            )}
            {goalId && goals.find(g => g.id === goalId)?.description && (
              <DialogDescription className="text-xs text-gray-500 mt-1 italic">
                {goals.find(g => g.id === goalId)?.description}
              </DialogDescription>
            )}
          </FormField>
          <DialogFooter className="flex flex-row justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              {t('actions.cancel')}
            </Button>
            <Button type="submit" disabled={!title || !goalId} className="bg-primary text-primary-foreground rounded-md border border-primary hover:bg-blue-500/10 hover:text-primary transition-colors">
              {initialTask ? t('component.taskDialog.updateButton') : t('component.taskDialog.createButton')}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </DialogOverlay>
  );
};

export default TaskDialog;