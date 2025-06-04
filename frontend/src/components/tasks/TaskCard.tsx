import React from 'react';
import type { Task } from '../../services/api';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onToggleStatus: (task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete, onToggleStatus }) => {
  const { t } = useTranslation();

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold mb-2">{task.title}</h3>
        <p className="text-sm text-gray-600">
          {t('tasks.status')}: {t(`tasks.statuses.${task.status}`)}
        </p>
        <div className="mt-4 flex justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggleStatus(task)}
            className="text-blue-600 border-blue-600 hover:bg-blue-50"
          >
            {task.status === 'pending' ? t('tasks.markComplete') : task.status === 'complete' ? t('tasks.markIncomplete') : t('tasks.markPending')}
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(task)}
            >
              {t('common.edit')}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(task.id)}
            >
              {t('common.delete')}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskCard;