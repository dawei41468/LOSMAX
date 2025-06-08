import React from 'react';
import type { Task } from '../../services/api';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '../ui/card';
import { Edit, Check, Trash2 } from 'lucide-react';

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
        <h3 className="text-lg font-semibold mb-2 mt-2 text-left">{task.title}</h3>
        <p className="text-sm text-gray-600 text-left">
          {t('tasks.status')}: <span className={`${task.status === 'complete' ? 'text-green-600 font-bold' : task.status === 'incomplete' ? 'text-red-600 font-bold' : 'text-gray-600'}`}>{t(`tasks.statuses.${task.status}`)}</span>
        </p>
        <div className="mt-4 flex justify-center space-x-8">
          <button
            onClick={() => onEdit(task)}
            aria-label={t('common.edit_button')}
            className="p-2 rounded-md transition-colors"
            disabled={!task.id}
          >
            <Edit className={`w-5 h-5 ${task.id ? 'text-blue-500' : 'text-gray-300'}`} />
          </button>
          <button
            onClick={() => onToggleStatus(task)}
            aria-label={task.status === 'pending' ? t('tasks.markComplete') : task.status === 'complete' ? t('tasks.markIncomplete') : t('tasks.markPending')}
            className={`p-2 rounded-md transition-colors ${task.status === 'pending' ? 'hover:text-green-600' : task.status === 'complete' ? 'hover:text-yellow-600' : 'hover:text-blue-600'}`}
            disabled={!task.id}
          >
            <Check className={`w-5 h-5 ${task.id ? (task.status === 'pending' ? 'text-green-500' : task.status === 'complete' ? 'text-yellow-500' : 'text-blue-500') : 'text-gray-300'}`} />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            aria-label={t('common.delete_button')}
            className="p-2 rounded-md transition-colors hover:text-red-600"
            disabled={!task.id}
          >
            <Trash2 className={`w-5 h-5 ${task.id ? 'text-red-500' : 'text-gray-300'}`} />
          </button>
        </div>
        <div className="text-xs text-gray-500 mt-4 text-right">
          Date: {new Date(task.created_at).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskCard;