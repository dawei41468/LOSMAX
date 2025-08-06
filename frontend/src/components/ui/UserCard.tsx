import React, { useContext } from 'react';
import { Card } from './card';
import { User } from 'lucide-react';
import { AuthContext } from '../../contexts/auth.context';
import { useTranslation } from 'react-i18next';

const UserCard: React.FC = () => {
  const { t } = useTranslation();
  const { userName, userEmail } = useContext(AuthContext);

  return (
    <Card variant="elevated">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-24 h-24 rounded-full border-1 border-standard flex items-center justify-center">
          <User className="w-16 h-16 text-primary" />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-semibold">{userName || t('profile.anonymous')}</h2>
          <p className="text-muted-foreground">{userEmail || t('profile.no_email')}</p>
        </div>
      </div>
    </Card>
  );
};

export default UserCard;