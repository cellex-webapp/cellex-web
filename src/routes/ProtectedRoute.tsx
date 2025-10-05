import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '@/stores/RootReducer';
import type { Role } from '@/stores/slices/authSlice';

interface ProtectedRouteProps {
  roles?: Role[]; // if provided, user must match one of these roles
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ roles }) => {
  const location = useLocation();
  const { isAuthenticated, user } = useSelector((s: RootState) => s.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && roles.length > 0) {
    const allowed = user && roles.includes(user.role);
    if (!allowed) {
      // redirect user to their role home
      const target = user?.role ? `/${user.role}` : '/';
      return <Navigate to={target} replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
