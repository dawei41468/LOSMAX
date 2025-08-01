import React from 'react';
import { useTranslation } from 'react-i18next';

interface OverviewStatsProps {
  totalGoals: number;
  completedGoals: number;
  inProgressGoals: number;
  avgProgress: number;
}

const OverviewStats: React.FC<OverviewStatsProps> = ({
  totalGoals,
  completedGoals,
  inProgressGoals,
  avgProgress,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">{t('progressPage.overview')}</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <div className= "border border-blue-200 bg-blue-50 p-4 rounded flex flex-col justify-end">
        <p className="text-sm text-gray-500">{t('progressPage.stats.totalGoals')}</p>
        <p className="text-2xl font-bold mb-4">{totalGoals}</p>
      </div>
      <div className="border border-green-200 bg-green-50 p-4 rounded flex flex-col justify-end">
        <p className="text-sm text-gray-500">{t('progressPage.stats.completedGoals')}</p>
        <p className="text-2xl font-bold mb-4">{completedGoals}</p>
      </div>
      <div className="border border-yellow-200 bg-yellow-50 p-4 rounded flex flex-col justify-end">
        <p className="text-sm text-gray-500">{t('progressPage.stats.inProgressGoals')}</p>
        <p className="text-2xl font-bold mb-4">{inProgressGoals}</p>
      </div>
      <div className="border border-purple-200 bg-purple-50 p-4 rounded flex flex-col justify-end">
        <p className="text-sm text-gray-500">{t('progressPage.stats.avgTaskCompletion')}</p>
        <p className="text-2xl font-bold mb-4">{avgProgress}%</p>
      </div>
      </div>
    </div>
  );
};

export default OverviewStats;