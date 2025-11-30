import React from 'react';
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
import { VendorDashboard } from '@/features/vendors/pages/Dashboard';
import AdminLayout from '@/features/admin/components/AdminLayout';
import VendorLayout from '@/features/vendors/components/VendorLayout';
import VendorNotificationsPage from '@/features/vendors/pages/Notifications/NotificationsPage';
import ProductsPage from '@/features/vendors/pages/Product/ProductsPage';
import CategoriesPage from '@/features/admin/pages/Categories/List/CategoriesPage';
import AttributesPage from '@/features/admin/pages/Categories/Attributes/AttributesPage';
import UsersListPage from '@/features/admin/pages/Users/List/UsersListPage';
import UserCreatePage from '@/features/admin/pages/Users/Create/UserCreatePage';
import AccountManagementPage from '@/features/clients/pages/AccountManagement/AccountManagementPage';
import ClientLayout from '@/features/clients/components/ClientLayout';
import PendingShopsPage from '@/features/admin/pages/Shops/RequestShops/PendingShopsPage';
import ShopsPage from '@/features/admin/pages/Shops/List/ShopsPage';
import VendorCategoriesPage from '@/features/vendors/pages/Categories/CategoriesPage';
import VendorAttributesPage from '@/features/vendors/pages/Categories/AttributesPage';
import AdminProductsPage from '@/features/admin/pages/Products/List/ProductsPage';
import HomePage from '@/features/clients/pages/Home/HomePage';
import ProductDetailPage from '@/features/clients/pages/Product/ProductDetailPage';
import CheckoutPage from '@/features/clients/pages/Checkout/CheckoutPage';
import VnpayReturnPage from '@/features/clients/pages/Payment/VnpayReturnPage';
import ProductByCategory from '@/features/clients/pages/Product/ProductByCategory';
import ProductByShop from '@/features/clients/pages/Product/ProductByShop';
import AttributeByCategoryPage from '@/features/admin/pages/Categories/Attributes/AttributeByCategoryPage';
import CartPage from '@/features/clients/pages/Cart/CartPage';
import MarketingSystemListPage from '@/features/admin/pages/Marketing/System/MarketingSystemPage';
import CampaignDetailPage from '@/features/admin/pages/Marketing/System/MarketingSystemDetailPage';
import SegmentCouponsPage from '@/features/admin/pages/Marketing/Segment/SegmentCouponsPage';
import ShopManagementPage from '@/features/vendors/pages/ShopManagement/ShopManagementPage';
import CustomerSegmentPage from '@/features/admin/pages/CustomerSegment/CustomerSegmentPage';
import AdminOrdersPage from '@/features/admin/pages/Orders/OrdersPage';
import VendorOrdersPage from '@/features/vendors/pages/Order/OrdersPage';
import NotificationsPage from '@/features/admin/pages/Notifications/NotificationsPage';

const router = createBrowserRouter([
  {
    element: <ProtectedRoute roles={['ADMIN']} />,
    children: [
      {
        path: '/admin',
        element: <AdminLayout />,
        children: [
          { index: true, element: <AdminDashboard /> },
          { path: 'categories', element: <CategoriesPage /> },
          { path: 'categories/attributes', element: <AttributeByCategoryPage /> },
          { path: 'categories/:slug/attributes', element: <AttributesPage /> },
          { path: 'products', element: <AdminProductsPage /> },
          { path: 'users', element: <UsersListPage /> },
          { path: 'users/create', element: <UserCreatePage /> },
          { path: 'orders', element: <AdminOrdersPage /> },
          { path: 'shops', element: <ShopsPage /> },
          { path: 'shops/pending', element: <PendingShopsPage /> },
          { path: 'marketing/system', element: <MarketingSystemListPage /> },
          { path: 'marketing/system/:id', element: <CampaignDetailPage /> },
          { path: 'marketing/segment', element: <SegmentCouponsPage /> },
          { path: 'customer-segments', element: <CustomerSegmentPage /> },
          { path: 'notifications', element: <NotificationsPage /> },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute roles={['USER']} />,
    children: [
      {
        path: '/',
        element: (
          <MainLayout>
            <ClientLayout />
          </MainLayout>
        ),
        children: [
          { index: true, element: <HomePage /> },
          { path: 'categories/:slug', element: <ProductByCategory /> },
          { path: 'shops/:id', element: <ProductByShop /> },
          { path: 'products/:id', element: <ProductDetailPage /> },
          { path: 'account', element: <AccountManagementPage /> },
          { path: 'cart', element: <CartPage /> },
          { path: 'checkout', element: <CheckoutPage /> },
          { path: 'payment/vnpay/return', element: <VnpayReturnPage /> },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute roles={['VENDOR']} />,
    children: [
      {
        path: '/vendor',
        element: <VendorLayout />,
        children: [
          { index: true, element: <VendorDashboard /> },
          { path: 'products', element: <ProductsPage /> },
          { path: 'categories', element: <VendorCategoriesPage /> },
          { path: 'categories/:slug/attributes', element: <VendorAttributesPage /> },
          { path: 'orders', element: <VendorOrdersPage /> },
          { path: 'orders/shipping', element: <VendorOrdersPage /> },
          { path: 'shop', element: <ShopManagementPage /> },
          { path: 'notifications', element: <VendorNotificationsPage /> },
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
