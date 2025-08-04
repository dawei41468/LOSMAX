import React from 'react';
import { useTranslation } from 'react-i18next';
import { getBadgeColorClass, type BadgeStatus } from '../../lib/badge-utils';

interface StatusBadgeProps {
  status: BadgeStatus;
  className?: string;
}

/**
 * A component that renders a status badge with appropriate styling.
 */
export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const { t } = useTranslation();
  const badgeColorClass = getBadgeColorClass(status);

  return (
    <span className={`badge ${badgeColorClass} ${className || ''}`}>
      {t(`common.${status}`)}
    </span>
  );
};