import { useTranslation } from 'react-i18next';
import { getTimeBasedGreeting } from './utils';

export interface GreetingProps {
  userName?: string | null;
}

export function Greeting({ userName }: GreetingProps) {
  const { t } = useTranslation();

  return (
    <div>
      <h2 className="text-2xl font-medium">
        {getTimeBasedGreeting(t)}, {userName || t('dashboard.user_fallback')}!
      </h2>
    </div>
  );
}