import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import SelectMenu from '@/components/ui/select-menu';
import type { Goal, GoalCategory } from '../../types/goals'; 
import { Button } from '../ui/button';
import {
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormField,
  FormLabel,
  FormInput,
  FormTextarea,
} from '@/components/ui/form';

// Define CATEGORIES locally as done in GoalsPage.tsx for LOSMAX
const CATEGORIES: GoalCategory[] = ["Family", "Work", "Health", "Personal"];

interface GoalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (goalData: Omit<Goal, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'days_remaining' | 'completed_at'>) => void;
  initialGoal?: Goal; // For editing
}

const GoalDialog: React.FC<GoalDialogProps> = ({ isOpen, onClose, onSubmit, initialGoal }) => {
  const { t } = useTranslation();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<GoalCategory>(CATEGORIES[0] as GoalCategory);
  const [targetDate, setTargetDate] = useState('');
  const [dateError, setDateError] = useState<string | null>(null);

  useEffect(() => {
    if (initialGoal) {
      setTitle(initialGoal.title);
      setDescription(initialGoal.description || '');
      setCategory(initialGoal.category);
      setTargetDate(initialGoal.target_date ? new Date(initialGoal.target_date).toISOString().split('T')[0] : '');
    } else {
      // Reset form for new goal
      setTitle('');
      setDescription('');
      setCategory(CATEGORIES[0] as GoalCategory);
      setTargetDate('');
    }
  }, [initialGoal, isOpen]); // Depend on isOpen to reset when dialog reopens for new goal

  const validateDate = (dateStr: string): boolean => {
    if (!dateStr) return false; // Date is mandatory
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Compare dates only
    return !isNaN(date.getTime()) && date >= today;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateDate(targetDate)) {
      setDateError(t('feedback.error.invalidDate'));
      return;
    }
    setDateError(null);

    onSubmit({
      title,
      description: description || undefined, // Ensure undefined if empty, not empty string
      category,
      target_date: targetDate,
      status: initialGoal?.status || 'active', // Default to active or preserve existing status
    });
    onClose(); // Close dialog after submission
  };

  if (!isOpen) {
    return null;
  }

  return (
    <DialogOverlay>
      <DialogContent 
        onClose={onClose} 
        className="shadow-xl max-w-md mx-auto bg-card"
      >
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="text-2xl font-bold mb-2 text-center sm:text-left">
            {initialGoal ? t('component.goalDialog.editTitle') : t('component.goalDialog.createTitle')}
          </DialogTitle>
        </DialogHeader>
        <Form onSubmit={handleSubmit} className="space-y-2 p-4 pt-0">
          <FormField>
            <FormLabel htmlFor="title" className="block mb-1 text-left">
              {t('component.goalDialog.yourGoal')}
            </FormLabel>
            <FormInput
              id="title"
              type="text"
              value={title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 border border-[var(--border)] rounded-[var(--radius)] bg-card text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </FormField>
          <FormField>
            <FormLabel htmlFor="description" className="block mb-1 text-left">
              {t('component.goalDialog.description')}
            </FormLabel>
            <FormTextarea
              id="description"
              value={description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-[var(--radius)] bg-card text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </FormField>
          <FormField>
            <FormLabel htmlFor="category" className="block mb-1 text-left">
              {t('component.goalDialog.category')}
            </FormLabel>
            <div className={initialGoal ? 'opacity-60 pointer-events-none' : ''}>
              <SelectMenu
                variant="default"
                size="default"
                value={category}
                onChange={(v) => setCategory(v as GoalCategory)}
                items={CATEGORIES.map((cat: GoalCategory) => ({
                  value: cat,
                  label: t(`content.categories.${cat.toLowerCase()}`),
                }))}
                placeholder={t('component.goalDialog.category')}
                className="w-full"
              />
            </div>
          </FormField>
          <FormField>
            <FormLabel htmlFor="target_date" className="block text-sm font-medium text-standard mb-1 text-left">
              {t('component.goalDialog.targetDate')}
            </FormLabel>
            <FormInput
              id="target_date"
              type="date"
              value={targetDate}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setTargetDate(e.target.value);
                if (dateError) setDateError(null);
              }}
              required
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-[var(--radius)] bg-card text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            {dateError && <p className="text-xs text-red-500 mt-1">{dateError}</p>}
          </FormField>
          <DialogFooter className="flex flex-row justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              {t('actions.cancel')}
            </Button>
            <Button type="submit" disabled={!title || !category || !targetDate}>
              {initialGoal ? t('component.goalDialog.updateButton') : t('component.goalDialog.createButton')}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </DialogOverlay>
  );
};

export default GoalDialog;