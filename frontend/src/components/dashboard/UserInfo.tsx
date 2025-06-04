import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Greeting } from './Greetings';

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
  userId,
  userEmail,
  userRole,
  userLanguage,
  preferences,
}) => {
  const { t } = useTranslation();

  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="border border-blue-100 text-left overflow-hidden">
      <CardHeader className="cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <CardTitle className="text-xl text-gray-700">
          <Greeting />
        </CardTitle>
      </CardHeader>
      <div
        className={`transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-96' : 'max-h-0'}`}
        style={{ overflow: 'hidden' }}
      >
        <CardContent className="space-y-2 text-sm">
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
        </CardContent>
      </div>
    </Card>
  );
};

export default UserInfo;