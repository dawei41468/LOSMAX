import type { TFunction } from 'i18next';

export function getTimeBasedGreeting(t: TFunction) {
  const hour = new Date().getHours();
  if (hour > 5 && hour < 12) return t('dashboard.greetings.morning');
  if (hour >= 12 && hour < 18) return t('dashboard.greetings.afternoon');
  if (hour >= 18 && hour < 22) return t('dashboard.greetings.evening');
  return t('dashboard.greetings.night');
}