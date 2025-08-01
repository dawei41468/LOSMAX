import React from 'react';
import { Outlet } from 'react-router-dom';
import { BottomNavLayout } from '../components/dashboard/BottomNavLayout';

export const MainLayoutRoutes: React.FC = () => {
  return (
    <BottomNavLayout>
      <Outlet />
    </BottomNavLayout>
  );
};