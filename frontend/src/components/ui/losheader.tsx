import React from 'react';
import { useTranslation } from 'react-i18next';
import { LosIcon } from './losicon';

interface LOSHeaderProps {
  variant?: 'auth' | 'sidebar' | 'mobile-sidebar';
  className?: string;
  size?: number;
}

const LOSHeader: React.FC<LOSHeaderProps> = ({
  variant = 'auth',
  className = '',
  size
}) => {
  const { t } = useTranslation();
  
  // Container classes
  const baseClasses = "flex items-center justify-center";
  const variantClasses = {
    auth: "flex-col py-4",
    sidebar: "flex-row px-4 py-2",
    'mobile-sidebar': "flex-row px-4 py-2" // Revert to row layout with logo and text side-by-side
  };
  
  // Text styling
  const textClasses = {
    auth: "text-sm font-medium mt-2", // Even smaller text for auth
    sidebar: "text-sm font-semibold ml-2",
    'mobile-sidebar': "text-xs font-medium ml-2" // Side-by-side with logo, smaller text
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      <LosIcon size={size ?? (
        variant === 'auth' ? 112 :
        variant === 'sidebar' ? 32 :
        44 // mobile-sidebar (increased from 32px)
      )} />
      
      {/* Subtitle - split into 3 lines */}
      <div className={`text-foreground ${textClasses[variant]} text-center`}>
        <div>{t('common.life')}</div>
        <div>{t('common.organization')}</div>
        <div>{t('common.system')}</div>
      </div>
    </div>
  );
};

export default LOSHeader;