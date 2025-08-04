import React from 'react';
import { useTranslation } from 'react-i18next';
import type { GoalStatus } from '../../types/goals'; // Assuming GoalStatus is defined here or similar

/**
 * A mapping of status names to their respective color classes for consistent styling.
 */
export const statusColors = {
  active: {
    bg: 'bg-[color-mix(in_srgb,var(--status-warning)_10%,transparent)]',
    text: 'text-[var(--status-warning)]',
  },
  completed: {
    bg: 'bg-[color-mix(in_srgb,var(--status-completed)_10%,transparent)]',
    text: 'text-[var(--status-completed)]',
  },
  paused: {
    bg: 'bg-[color-mix(in_srgb,var(--status-paused)_10%,transparent)]',
    text: 'text-[var(--status-paused)]',
  },
  cancelled: {
    bg: 'bg-[color-mix(in_srgb,var(--status-cancelled)_10%,transparent)]',
    text: 'text-[var(--status-cancelled)]',
  },
} as const;

type StatusColorType = keyof typeof statusColors['active'];

/**
 * Retrieves the Tailwind CSS class for a specific status and color type.
 */
export const getBadgeColorClass = (
  status: GoalStatus,
  type: StatusColorType = 'text'
) => {
  const colors = statusColors[status] || statusColors.active; // Default to active if status not found
  return colors[type];
};

interface StatusBadgeProps {
  status: GoalStatus;
  className?: string;
}

/**
 * A component that renders a status badge with appropriate styling.
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const { t } = useTranslation();
  const bgColorClass = getBadgeColorClass(status, 'bg');
  const textColorClass = getBadgeColorClass(status, 'text');

  return (
    <span className={`badge ${bgColorClass} ${textColorClass} ${className || ''}`}>
      {t(`common.${status}`)}
    </span>
  );
};