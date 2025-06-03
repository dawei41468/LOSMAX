import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth'; // Assuming similar hook in LOSMAX
import { Settings, LogOut, User } from 'lucide-react'; // Added User icon
import { useNavigate } from 'react-router-dom';

export const ProfileMenu: React.FC = () => {
  const { t } = useTranslation();
  const { isAuthenticated, logout, userName, userEmail } = useAuth(); // Get userName and userEmail from context
  const [isOpen, setIsOpen] = useState(false);
  // const [displayName, setDisplayName] = useState<string | null>(null); // Removed local state for displayName
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []); // Removed dependency on displayName

  // Render nothing if not authenticated or if auth state is loading
  if (isAuthenticated === false || isAuthenticated === null) return null;

  return (
    <div className="relative pl-4" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center hover:bg-gray-300" // Generic button
      >
        <User className="h-5 w-5" />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
          {/* Only render this section if userEmail is available */}
          {userEmail && (
            <div className="p-3 border-b border-gray-200 text-left">
              {/* Display userName if it's available */}
              {userName && (
                <p className="text-sm font-medium truncate" title={userName}>
                  {userName}
                </p>
              )}
              {/* Always display userEmail if available. Add margin if userName was also displayed. */}
              <p className={`text-xs text-gray-500 truncate ${userName ? 'mt-1' : ''}`} title={userEmail}>
                {userEmail}
              </p>
            </div>
          )}
          <button
            onClick={() => {
              navigate('/settings');
              setIsOpen(false);
            }}
            className="w-full text-left p-3 hover:bg-gray-100 flex items-center gap-3"
          >
            <Settings className="text-gray-700 stroke-[2] w-4 h-4" /> <span className="text-sm">{t('profile.settings')}</span>
          </button>
          <hr className="border-gray-200 -mx-3" />
          <button 
            onClick={async () => {
              try {
                await logout(); // Using LOSMAX's logout
              } catch (err) {
                console.error('Logout failed:', err);
                // TODO: Add user-facing error handling, e.g., via a toast
              }
            }}
            className="w-full text-left p-3 hover:bg-gray-100 flex items-center gap-3"
          >
            <LogOut className="text-gray-700 stroke-[2] w-4 h-4" /> <span className="text-sm">{t('profile.signout')}</span>
          </button>
        </div>
      )}
    </div>
  );
};