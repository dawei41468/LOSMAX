import React from 'react';
import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';

interface BottomNavLayoutProps {
  children?: React.ReactNode;
}

export const BottomNavLayout: React.FC<BottomNavLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col relative">
      <div className="flex-1 pb-20 w-full pt-4">
        <main className="w-full">
          {children || <Outlet />}
        </main>
      </div>
      <BottomNav className="fixed bottom-0 left-0 right-0 z-50" />
    </div>
  );
};