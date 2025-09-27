import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const PublicRoute = () => {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (isAuthenticated && role) {
    let returnUrl = "/";
    if (role === 'ADMIN') returnUrl = '/admin';
    if (role === 'CLIENT') returnUrl = '/client';
    if (role === 'VENDOR') returnUrl = '/vendor';

    return <Navigate to={returnUrl} replace />;
  }

  return <Outlet />;
};

export default PublicRoute;