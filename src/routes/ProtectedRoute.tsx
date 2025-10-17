import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth'; 

interface ProtectedRouteProps {
  roles?: UserRole[]; 
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ roles }) => {
  const location = useLocation();
  const { isAuthenticated, currentUser } = useAuth();

  const roleToHome = (role?: UserRole) => {
    const r = (role || '').toLowerCase();
    if (r === 'admin') return '/admin';
    if (r === 'vendor') return '/vendor';
    return '/client';
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && roles.length > 0) {
    const userHasRequiredRole = currentUser && roles.includes(currentUser.role);
    
    if (!userHasRequiredRole) {
      const target = roleToHome(currentUser?.role);
      return <Navigate to={target} replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;