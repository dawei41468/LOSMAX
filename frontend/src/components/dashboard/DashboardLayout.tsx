import { useTranslation } from 'react-i18next';
import { Sidebar } from './Sidebar'; // Adjusted import path
import { MobileSidebar } from './MobileSidebar'; // Adjusted import path
import { ProfileMenu } from './ProfileMenu'; // Adjusted import path
import { useAuth } from '../../hooks/useAuth'; // Adjusted import path
import { MenuIcon } from 'lucide-react';
import { useState } from 'react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  route?: string;
}

export function DashboardLayout({ children, route }: DashboardLayoutProps) {
  const { isAuthenticated } = useAuth(); // Using isAuthenticated from LOSMAX
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const { t } = useTranslation();
  
  const getTitle = () => {
    switch(route) {
      case '/goals': return {
        title: t('dashboard.titles.goals', 'Goals Management'), // Added fallback text
        subtitle: t('dashboard.subtitles.goals', 'Set and track your personal and professional goals.') // Added fallback text
      };
      case '/tasks': return {
        title: t('dashboard.titles.tasks', 'Task Management'), // Added fallback text
        subtitle: t('dashboard.subtitles.tasks', 'Organize and manage your daily tasks efficiently.') // Added fallback text
      };
      case '/progress': return {
        title: t('dashboard.titles.progress', 'Progress Overview'), // Added fallback text
        subtitle: t('dashboard.subtitles.progress', 'Monitor your progress across goals and tasks.') // Added fallback text
      };
      case '/settings': return {
        title: t('dashboard.titles.settings', 'Settings'), // Added fallback text
        subtitle: t('dashboard.subtitles.settings', 'Configure your application preferences.') // Added fallback text
      };
      default: return {
        title: t('dashboard.titles.dashboard', 'Dashboard'), // Added fallback text
        subtitle: t('dashboard.subtitles.dashboard', 'Welcome to your LOSMAX dashboard.') // Added fallback text and changed to LOSMAX
      };
    }
  };

  const { title, subtitle } = getTitle();

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  // If auth state is loading or user is not authenticated,
  // you might want to render a loading indicator or redirect.
  // For now, the layout will render, and ProfileMenu will handle its own visibility.
  // if (isAuthenticated === null) {
  //   return <div>Loading authentication state...</div>; 
  // }
  // if (isAuthenticated === false) {
  //   // Or redirect to login using useNavigate()
  //   return <div>User not authenticated. Please log in.</div>;
  // }


  return (
    <div className="flex h-screen">
      <Sidebar activeRoute={route} className="hidden lg:block" />
      <MobileSidebar isOpen={isMobileSidebarOpen} onClose={() => setIsMobileSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header Section Wrapper for Full-Width Border */}
        <div className="border-b border-gray-200">
          <div className="flex items-center justify-between px-0 sm:px-4 py-1"> {/* Padding moved to inner div */}
            {/* Left part: Menu button */}
            <button
              className="lg:hidden text-gray-500 hover:text-gray-700"
              onClick={toggleMobileSidebar}
              aria-label="Toggle mobile sidebar"
            >
              <MenuIcon className="h-6 w-6" />
            </button>
            
            {/* Center part: Title/Subtitle - flex-grow to push ProfileMenu to the right, min-w-0 for truncation */}
            <div className="ml-2 flex-grow min-w-0"> {/* Added flex-grow and min-w-0 */}
              <h1 className="text-xl sm:text-xl font-bold truncate">{title}</h1>
              <p className="text-xs sm:text-sm text-gray-400">{subtitle}</p> {/* Removed truncate to allow wrapping */}
            </div>

            {/* Right part: Profile Menu */}
            {isAuthenticated && <ProfileMenu />}
          </div>
        </div>
        <main className="flex-1 overflow-auto px-0 bg-white">
          {children}
        </main>
      </div>
    </div>
  );
}