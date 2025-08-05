import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '../ui/card'; // Import the Card component

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
  const { t } = useTranslation('translation');

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      <h2 className="text-xl font-semibold">{t('component.overview.title')}</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <Card style={{ backgroundColor: '#EFF6FF' }} className="border border-blue-200 p-4 rounded flex flex-col justify-end">
        <p className="text-sm text-gray-500">{t('component.overview.totalGoalsDesc')}</p>
        <p className="text-2xl text-slate-600 font-bold mb-4">{totalGoals}</p>
      </Card>
      <Card style={{ backgroundColor: '#F0FDF4' }} className="border border-green-200 p-4 rounded flex flex-col justify-end">
        <p className="text-sm text-gray-500">{t('component.overview.completedGoalsDesc')}</p>
        <p className="text-2xl text-slate-600 font-bold mb-4">{completedGoals}</p>
      </Card>
      <Card style={{ backgroundColor: '#FEFCBF' }} className="border border-yellow-200 p-4 rounded flex flex-col justify-end">
        <p className="text-sm text-gray-500">{t('component.overview.inProgressGoalsDesc')}</p>
        <p className="text-2xl text-slate-600 font-bold mb-4">{inProgressGoals}</p>
      </Card>
      <Card style={{ backgroundColor: '#FAF5FF' }} className="border border-purple-200 p-4 rounded flex flex-col justify-end">
        <p className="text-sm text-gray-500">{t('component.overview.avgTaskCompletionDesc')}</p>
        <p className="text-2xl text-slate-600 font-bold mb-4">{avgProgress}%</p>
      </Card>
      </div>
    </div>
  );
};

export default OverviewStats;