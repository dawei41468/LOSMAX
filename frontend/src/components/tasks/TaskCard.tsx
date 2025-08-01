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
    <Card className="task-card">
      <CardContent className="card-content">
        <h3 className="text-lg font-semibold mb-2">{task.title}</h3>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm text-muted">{t('tasks.status')}:</span>
          <span className={`badge badge-sm ${task.status === 'complete' ? 'badge-completed' : 'badge-pending'}`}>
            {t(`tasks.statuses.${task.status}`)}
          </span>
        </div>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => onEdit(task)}
            aria-label={t('common.edit_button')}
            className="btn btn-ghost btn-sm"
            disabled={!task.id}
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onToggleStatus(task)}
            aria-label={task.status === 'complete' ? t('tasks.markIncomplete') : t('tasks.markComplete')}
            className="btn btn-ghost btn-sm"
            disabled={!task.id}
          >
            <Check className={`w-4 h-4 ${task.status === 'complete' ? 'text-warning' : 'text-success'}`} />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            aria-label={t('common.delete_button')}
            className="btn btn-ghost btn-sm"
            disabled={!task.id}
          >
            <Trash2 className="w-4 h-4 text-destructive" />
          </button>
        </div>
        <div className="text-xs text-muted mt-4 text-right">
          {new Date(task.created_at).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskCard;