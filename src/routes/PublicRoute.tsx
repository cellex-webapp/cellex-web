import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '@/stores/RootReducer';

const PublicRoute: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated, user } = useSelector((s: RootState) => s.auth);

  if (isAuthenticated) {
    const target = user?.role ? `/${user.role}` : '/';
    return <Navigate to={target} state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
