import React from 'react';
import { useTranslation } from 'react-i18next';

interface ProgressStatsProps {
  totalGoals: number;
  completedGoals: number;
  inProgressGoals: number;
  avgProgress: number;
}

const ProgressStats: React.FC<ProgressStatsProps> = ({
  totalGoals,
  completedGoals,
  inProgressGoals,
  avgProgress,
}) => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <div className="bg-blue-50 p-4 rounded flex flex-col justify-end">
        <p className="text-sm text-gray-500">{t('progressPage.stats.totalGoals')}</p>
        <p className="text-2xl font-bold mb-4">{totalGoals}</p>
      </div>
      <div className="bg-green-50 p-4 rounded flex flex-col justify-end">
        <p className="text-sm text-gray-500">{t('progressPage.stats.completedGoals')}</p>
        <p className="text-2xl font-bold mb-4">{completedGoals}</p>
      </div>
      <div className="bg-yellow-50 p-4 rounded flex flex-col justify-end">
        <p className="text-sm text-gray-500">{t('progressPage.stats.inProgressGoals')}</p>
        <p className="text-2xl font-bold mb-4">{inProgressGoals}</p>
      </div>
      <div className="bg-purple-50 p-4 rounded flex flex-col justify-end">
        <p className="text-sm text-gray-500">{t('progressPage.stats.avgTaskCompletion')}</p>
        <p className="text-2xl font-bold mb-4">{avgProgress}%</p>
      </div>
    </div>
  );
};

export default ProgressStats;