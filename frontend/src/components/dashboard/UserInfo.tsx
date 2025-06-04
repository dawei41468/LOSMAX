import React from 'react';
import { useTranslation } from 'react-i18next';

interface UserInfoProps {
  userName: string | null;
  userId: string | null;
  userEmail: string | null;
  userRole: string | null;
  userLanguage: string | null;
  preferences: {
    morning_deadline: string;
    evening_deadline: string;
    notifications_enabled: boolean;
  } | null;
}

const UserInfo: React.FC<UserInfoProps> = ({
  userName,
  userId,
  userEmail,
  userRole,
  userLanguage,
  preferences,
}) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white p-6 rounded-lg shadow-md text-left">
      <h2 className="text-xl font-semibold text-gray-700 mb-4">
        {userName ? `${userName}` : ''}
      </h2>
      <div className="space-y-2 text-sm">
        <p><span className="font-medium">{t('dashboard.userId')}:</span> {userId || t('dashboard.notAvailable')}</p>
        <p><span className="font-medium">{t('common.email')}:</span> {userEmail || t('dashboard.notAvailable')}</p>
        <p><span className="font-medium">{t('dashboard.role')}:</span> {userRole || t('dashboard.notAvailable')}</p>
        <p><span className="font-medium">{t('common.language')}:</span> {userLanguage || t('dashboard.notAvailable')}</p>
        {preferences && (
          <>
            <p><span className="font-medium">{t('dashboard.morningDeadline')}:</span> {preferences.morning_deadline}</p>
            <p><span className="font-medium">{t('dashboard.eveningDeadline')}:</span> {preferences.evening_deadline}</p>
            <p><span className="font-medium">{t('dashboard.notifications')}:</span> {preferences.notifications_enabled ? t('dashboard.enabled') : t('dashboard.disabled')}</p>
          </>
        )}
      </div>
    </div>
  );
};

export default UserInfo;