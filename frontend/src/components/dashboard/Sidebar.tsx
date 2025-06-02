import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { LanguageSwitcher } from './LanguageSwitcher'; // Adjusted import path
import {
  Home,
  ClipboardList,
  CheckCircle,
  BarChart2,
  Settings
} from 'lucide-react';

interface SidebarProps {
  activeRoute?: string;
  className?: string;
}

export function Sidebar({ activeRoute, className = "" }: SidebarProps) {
  const { t } = useTranslation();
  const isActive = (route: string) => {
    if (!activeRoute) return false;
    if (route === '/dashboard') return activeRoute === '/' || activeRoute === '/dashboard';
    return activeRoute.startsWith(route);
  };

  return (
    <div className={`w-64 h-full bg-white border-r border-gray-200 p-4 relative ${className}`}> {/* Add relative positioning */}
      <h1 className="text-2xl font-bold mb-4">{t('sidebar.losmax')}</h1> {/* Changed to LOSMAX */}
      <hr className="my-2 border-gray-200 -mx-4" />
      
      <nav className="space-y-2">
        <Link
          to="/dashboard"
          className={`flex items-center gap-3 p-2 rounded hover:bg-gray-200 ${isActive('/dashboard') ? 'bg-gray-100' : 'hover:bg-gray-100'}`}
        >
          <Home className="w-6 h-6 text-gray-600 stroke-[2]" />
          <span>{t('sidebar.dashboard')}</span>
        </Link>
        <Link
          to="/goals"
          className={`flex items-center gap-3 p-2 rounded ${isActive('/goals') ? 'bg-gray-100' : 'hover:bg-gray-100'}`}
        >
          <ClipboardList className="w-6 h-6 text-gray-600 stroke-[2]" />
          <span>{t('sidebar.goals')}</span>
        </Link>
        <Link
          to="/tasks"
          className={`flex items-center gap-3 p-2 rounded ${isActive('/tasks') ? 'bg-gray-100' : 'hover:bg-gray-100'}`}
        >
          <CheckCircle className="w-6 h-6 text-gray-600 stroke-[2]" />
          <span>{t('sidebar.tasks')}</span>
        </Link>
        <Link
          to="/progress"
          className={`flex items-center gap-3 p-2 rounded ${isActive('/progress') ? 'bg-gray-100' : 'hover:bg-gray-100'}`}
        >
          <BarChart2 className="w-6 h-6 text-gray-600 stroke-[2]" />
          <span>{t('sidebar.progress')}</span>
        </Link>
        <Link
          to="/settings"
          className={`flex items-center gap-3 p-2 rounded ${isActive('/settings') ? 'bg-gray-100' : 'hover:bg-gray-100'}`}
        >
          <Settings className="w-6 h-6 text-gray-600 stroke-[2]" />
          <span>{t('sidebar.settings')}</span>
        </Link>
      </nav>

      {/* Language Switcher at the bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-2 flex items-center justify-center bg-white border-t border-gray-200"> {/* Use absolute positioning and flex row */}
        <div className="text-sm font-medium text-gray-700 mr-2"> {/* Add margin right */}
          {t('sidebar.language')} {/* Use translation key for Language */}
        </div>
        <LanguageSwitcher />
      </div>
    </div>
  );
}