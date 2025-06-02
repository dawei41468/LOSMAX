import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';

export const MainLayoutRoutes: React.FC = () => {
  const location = useLocation();
  
  return (
    <DashboardLayout route={location.pathname}>
      <Outlet />
    </DashboardLayout>
  );
};