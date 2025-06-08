import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { useAuth } from '../../hooks/useAuth';

export function getTimeBasedGreeting(t: TFunction) {
  const hour = new Date().getHours();
  if (hour > 5 && hour < 12) return t('dashboard.greetings.morning');
  if (hour >= 12 && hour < 18) return t('dashboard.greetings.afternoon');
  if (hour >= 18 && hour < 22) return t('dashboard.greetings.evening');
  return t('dashboard.greetings.night');
}

export function Greeting() {
  const { t } = useTranslation();
  const { userName } = useAuth();

  return (
    <div>
      <h2 className="text-2xl font-medium">
        {getTimeBasedGreeting(t)}, {userName || t('dasboard.user_fallback')}!
      </h2>
    </div>
  );
}