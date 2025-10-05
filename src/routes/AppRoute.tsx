import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';
import { MainLayout } from '@/components/layouts/MainLayout';
import PublicLayout from '@/components/layouts/PublicLayout';
import LoginPage from '@/features/auth/pages/LoginPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import SignupPage from '@/features/auth/pages/SignupPage';
import OTPPage from '@/features/auth/pages/OTPPage';
import { AdminDashboard } from '@/features/admin/pages/Dashboard';
import { ClientDashboard } from '@/features/clients/pages/Dashboard';
import { VendorDashboard } from '@/features/vendors/pages/Dashboard';
import AdminLayout from '@/features/admin/components/AdminLayout';
import VendorLayout from '@/features/vendors/components/VendorLayout';
import CategoriesPage from '@/features/admin/pages/CategoriesPage';

const router = createBrowserRouter([
  // role specific routes
  {
    element: <ProtectedRoute roles={['admin']} />,
    children: [
      {
        path: '/admin',
        element: <AdminLayout />,
        children: [
          { index: true, element: <AdminDashboard /> },
          { path: 'categories', element: <CategoriesPage /> },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute roles={['client']} />,
    children: [
      {
        path: '/client',
        element: (
          <MainLayout>
            <ClientDashboard />
          </MainLayout>
        ),
      },
    ],
  },
  {
    element: <ProtectedRoute roles={['vendor']} />,
    children: [
      {
        path: '/vendor',
        element: <VendorLayout />,
        children: [
          { index: true, element: <VendorDashboard /> },
        ],
      },
    ],
  },
  {
    element: <PublicRoute />,
    children: [
      {
        element: <PublicLayout />,
        children: [
          { index: true, element: <Navigate to="/login" replace /> },
          { path: 'login', element: <LoginPage /> },
          { path: 'signup', element: <SignupPage /> },
          { path: 'otp', element: <OTPPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);

export const AppRoute: React.FC = () => {
  return <RouterProvider router={router} />;
};

export default AppRoute;
