import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { Task } from '../../services/api';
import type { Goal } from '../../types/goals';
import { getGoals } from '../../services/api';
import { Button } from '../ui/button';

interface TaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Task, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  initialTask?: Task;
}

const TaskDialog: React.FC<TaskDialogProps> = ({ isOpen, onClose, onSubmit, initialTask }) => {
  const { t } = useTranslation();
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
    } finally {
      setIsLoadingGoals(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !goalId) return;
    onSubmit({ title, goal_id: goalId, status: 'pending' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">
            {initialTask ? t('tasks.edit') : t('tasks.create')}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1 text-left">
                {t('tasks.title')}
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                required
                placeholder={t('tasks.titlePlaceholder')}
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label htmlFor="goal" className="block text-sm font-medium text-gray-700 mb-1 text-left">
                {t('tasks.associatedGoal')}
              </label>
              <select
                id="goal"
                value={goalId}
                onChange={(e) => setGoalId(e.target.value)}
                required
                disabled={!!initialTask || isLoadingGoals}
                className="w-full p-2 border rounded-md"
              >
                <option value="" disabled>
                  {isLoadingGoals ? t('common.loading') : t('tasks.selectGoal')}
                </option>
                {goals.map((goal) => (
                  <option key={goal.id} value={goal.id}>
                    {goal.title}
                  </option>
                ))}
              </select>
              {initialTask && (
                <p className="text-xs text-gray-500 mt-1">{t('tasks.goalCannotChange')}</p>
              )}
              {goalId && goals.find(g => g.id === goalId)?.description && (
                <p className="text-xs text-gray-500 mt-1 italic">
                  {goals.find(g => g.id === goalId)?.description}
                </p>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={!title || !goalId}>
                {initialTask ? t('tasks.update') : t('tasks.create')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TaskDialog;