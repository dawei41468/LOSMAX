import React from 'react';
import type { Task } from '../../types/tasks';
import { useTranslation } from 'react-i18next';
import { Edit, Check, Trash2 } from 'lucide-react';
import { formatDate, formatDateShort } from '../../lib/utils';
import { StatusBadge } from '../ui/BadgeUI';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onToggleStatus: (task: Task) => void;
  useShortDate?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete, onToggleStatus, useShortDate = true }) => {
  const { t } = useTranslation();


  return (
    <div className="p-2 border rounded-lg border-standard hover:shadow-md transition-shadow bg-card text-card-foreground">
      <div className="text-md font-medium mb-1 text-left">
        {task.title}
      </div>
      <div className="grid grid-cols-[auto_80px_auto] gap-2 items-center">
        <div>
          <span className="text-xs text-muted-foreground">
            {useShortDate ? formatDateShort(task.created_at) : formatDate(task.created_at)}
          </span>
        </div>
        <div>
          <StatusBadge status={task.status} />
        </div>
        <div className="flex items-center justify-end gap-0">
          <button
            onClick={() => onEdit(task)}
            aria-label={t('actions.edit')}
            className="btn btn-ghost btn-xs px-1 py-1 h-7 min-h-7"
            disabled={!task.id}
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onToggleStatus(task)}
            aria-label={task.status === 'completed' ? t('actions.markIncomplete') : t('actions.markComplete')}
            className="btn btn-ghost btn-xs px-1 py-1 h-7 min-h-7"
            disabled={!task.id}
          >
            <Check className={`w-3.5 h-3.5 ${task.status === 'completed' ? 'text-warning' : 'text-success'}`} />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            aria-label={t('actions.delete')}
            className="btn btn-ghost btn-xs px-1 py-1 h-7 min-h-7"
            disabled={!task.id}
          >
            <Trash2 className="w-3.5 h-3.5 text-destructive" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;