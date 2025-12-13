import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { useCallback } from 'react';
import {
  fetchAdminDashboard,
  fetchCustomerAnalytics,
  fetchShopAnalytics,
  fetchProductAnalytics,
  fetchVendorDashboard,
  clearAnalytics
} from '@/stores/slices/analytics.slice';
import {
  selectAdminDashboard,
  selectCustomerAnalytics,
  selectShopAnalytics,
  selectProductAnalytics,
  selectVendorDashboard,
  selectAnalyticsLoading,
  selectAnalyticsError
} from '@/stores/selectors/analytics.selector';

export const useAnalytics = () => {
  const dispatch = useAppDispatch();

  // Selectors
  const adminDashboard = useAppSelector(selectAdminDashboard);
  const customerAnalytics = useAppSelector(selectCustomerAnalytics);
  const shopAnalytics = useAppSelector(selectShopAnalytics);
  const productAnalytics = useAppSelector(selectProductAnalytics);
  const vendorDashboard = useAppSelector(selectVendorDashboard);
  
  const isLoading = useAppSelector(selectAnalyticsLoading);
  const error = useAppSelector(selectAnalyticsError);

  // Actions
  const loadAdminDashboard = useCallback((params?: IAnalyticsParams) => 
    dispatch(fetchAdminDashboard(params)), [dispatch]);

  const loadCustomerAnalytics = useCallback((params?: IAnalyticsParams) => 
    dispatch(fetchCustomerAnalytics(params)), [dispatch]);

  const loadShopAnalytics = useCallback((params?: IAnalyticsParams) => 
    dispatch(fetchShopAnalytics(params)), [dispatch]);

  const loadProductAnalytics = useCallback((params?: IAnalyticsParams) => 
    dispatch(fetchProductAnalytics(params)), [dispatch]);

  const loadVendorDashboard = useCallback((params: IVendorAnalyticsParams) => 
    dispatch(fetchVendorDashboard(params)), [dispatch]);
  
  const reset = useCallback(() => dispatch(clearAnalytics()), [dispatch]);

  return {
    // Data
    adminDashboard,
    customerAnalytics,
    shopAnalytics,
    productAnalytics,
    vendorDashboard,
    
    isLoading,
    error,

    // Functions
    fetchAdminDashboard: loadAdminDashboard,
    fetchCustomerAnalytics: loadCustomerAnalytics,
    fetchShopAnalytics: loadShopAnalytics,
    fetchProductAnalytics: loadProductAnalytics,
    fetchVendorDashboard: loadVendorDashboard,
    clearAnalytics: reset,
  };
};