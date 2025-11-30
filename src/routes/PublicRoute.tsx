import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth'; 

const PublicRoute: React.FC = () => {
  const { isAuthenticated, currentUser } = useAuth();

  const roleToHome = (role?: UserRole) => {
    const r = (role || '').toLowerCase();
    if (r === 'admin') return '/admin';
    if (r === 'vendor') return '/vendor';
    return '/client';
  };

  if (isAuthenticated) {
    const target = roleToHome(currentUser?.role);
    return <Navigate to={target} replace />;
  }

  return <Outlet />;
};

export default PublicRoute;