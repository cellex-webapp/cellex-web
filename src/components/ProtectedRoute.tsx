import { Navigate, Outlet } from "react-router-dom";
import { useCurrentApp } from "./context/app.context";
import type { UserRole } from "../types/user";

type Props = {
  roles?: UserRole[];
  redirectTo?: string;
};

const ProtectedRoute = ({ roles, redirectTo = "/login" }: Props) => {
  const { isAuthenticated, user, isLoading } = useCurrentApp();

  if (isLoading) return null; // or a spinner

  if (!isAuthenticated || !user) {
    return <Navigate to={redirectTo} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    // redirect to a basic landing page based on role
    return <Navigate to={`/${user.role}`} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
