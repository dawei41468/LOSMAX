import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home,
  ClipboardList,
  CheckCircle,
  BarChart2,
  User
} from 'lucide-react';

interface BottomNavProps {
  className?: string;
}

export function BottomNav({ className }: BottomNavProps) {
  const { t } = useTranslation();
  const location = useLocation();

  const isActive = (route: string) => {
    if (route === '/dashboard') return location.pathname === '/' || location.pathname === '/dashboard';
    return location.pathname.startsWith(route);
  };

  return (
    <div className={`bottom-nav bg-surface shadow-[0_-1px_2px_0_rgba(0,0,0,0.05)] h-[var(--app-bottomnav-h)] flex items-center ${className}`}>
      <nav className="bottom-nav-nav w-full grid grid-cols-5 gap-0">
        <Link
          to="/dashboard"
          className={`flex flex-col items-center rounded-lg ${isActive('/dashboard') ? 'text-primary' : 'text-muted-foreground'}`}
        >
          <Home className="w-5 h-5" strokeWidth={1} />
          <span className="text-xs mt-1 w-16 text-center truncate">{t('navigation.home')}</span>
        </Link>

        <Link
          to="/goals"
          className={`flex flex-col items-center rounded-lg ${isActive('/goals') ? 'text-primary' : 'text-muted-foreground'}`}
        >
          <ClipboardList className="w-5 h-5" strokeWidth={1} />
          <span className="text-xs mt-1 w-16 text-center truncate">{t('navigation.goals')}</span>
        </Link>

        <Link
          to="/tasks"
          className={`flex flex-col items-center rounded-lg ${isActive('/tasks') ? 'text-primary' : 'text-muted-foreground'}`}
        >
          <CheckCircle className="w-5 h-5" strokeWidth={1} />
          <span className="text-xs mt-1 w-16 text-center truncate">{t('navigation.tasks')}</span>
        </Link>

        <Link
          to="/progress"
          className={`flex flex-col items-center rounded-lg ${isActive('/progress') ? 'text-primary' : 'text-muted-foreground'}`}
        >
          <BarChart2 className="w-5 h-5" strokeWidth={1} />
          <span className="text-xs mt-1 w-16 text-center truncate">{t('navigation.progress')}</span>
        </Link>

        <Link
          to="/profile"
          className={`flex flex-col items-center rounded-lg ${isActive('/profile') ? 'text-primary' : 'text-muted-foreground'}`}
        >
          <User className="w-5 h-5" strokeWidth={1} />
          <span className="text-xs mt-1 w-16 text-center truncate">{t('navigation.profile')}</span>
        </Link>
      </nav>
    </div>
  );
}