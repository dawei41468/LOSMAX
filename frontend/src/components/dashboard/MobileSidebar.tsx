import React from "react";
import { Link, useLocation } from "react-router-dom";
import { XIcon, HomeIcon, ClipboardListIcon, CheckCircleIcon, BarChart3Icon, SettingsIcon } from "lucide-react";
import { LanguageSwitcher } from './LanguageSwitcher'; // Adjusted import path
import { useTranslation } from 'react-i18next'; 

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const location = useLocation();

  const { t } = useTranslation();
  const navItems = [
    { href: "/dashboard", label: t('common.dashboard'), icon: <HomeIcon className="mr-4 h-6 w-6" /> },
    { href: "/goals", label: t('common.goals'), icon: <ClipboardListIcon className="mr-4 h-6 w-6" /> },
    { href: "/tasks", label: t('common.tasks'), icon: <CheckCircleIcon className="mr-4 h-6 w-6" /> },
    { href: "/progress", label: t('common.progress'), icon: <BarChart3Icon className="mr-4 h-6 w-6" /> },
    { href: "/settings", label: t('common.settings'), icon: <SettingsIcon className="mr-4 h-6 w-6" /> },
  ];

  const handleNavClick = () => {
    onClose();
  };

  return (
    <>
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-20 transition-opacity pointer-events-auto bg-black/50"
          aria-hidden="true"
          onClick={onClose}
        ></div>
      )}
      <div 
        className={`lg:hidden fixed inset-y-0 left-0 w-64 bg-white z-30 transition-all duration-300 ease-in-out overflow-y-auto ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between h-22 flex-shrink-0 px-4 border-b border-gray-200">
            <h1 className="text-2xl font-medium text-primary flex-1 text-center">LOSMAX</h1>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <XIcon className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 py-4">
            <div className="px-2 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={handleNavClick}
                  className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                    location.pathname === item.href
                      ? "text-gray-900 bg-gray-100"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  {React.cloneElement(item.icon, {
                    className: `mr-4 h-6 w-6 ${
                      location.pathname === item.href ? "text-primary" : "text-gray-500"
                    }`,
                  })}
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>

          {/* Language Switcher at the bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-4 flex items-center justify-center bg-white border-t border-gray-200"> {/* Use absolute positioning and flex row */}
            <div className="text-sm font-medium text-gray-700 mr-2"> {/* Add margin right */}
              {useTranslation().t('common.language')} {/* Use translation key for Language */}
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </div>
    </>
  );
}

// Removed default export as LOSMAX typically uses named exports for components
// export default MobileSidebar;