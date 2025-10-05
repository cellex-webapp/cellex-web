import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '@/stores/RootReducer';

const PublicRoute: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated, user } = useSelector((s: RootState) => s.auth);

  const roleToHome = (raw?: string) => {
    const r = (raw || '').toLowerCase();
    if (r === 'admin') return '/admin';
    if (r === 'vendor') return '/vendor';
    if (r === 'client' || r === 'user') return '/client';
    return '/client';
  };

  if (isAuthenticated) {
    const target = roleToHome(user?.role);
    return <Navigate to={target} state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
