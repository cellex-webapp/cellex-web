import { type RootState } from '@/stores/store';

export const selectAnalyticsState = (state: RootState) => state.analytics;

// Main Data Selectors
export const selectAdminDashboard = (state: RootState) => state.analytics.adminDashboard;
export const selectCustomerAnalytics = (state: RootState) => state.analytics.customerAnalytics;
export const selectShopAnalytics = (state: RootState) => state.analytics.shopAnalytics;
export const selectProductAnalytics = (state: RootState) => state.analytics.productAnalytics;
export const selectVendorDashboard = (state: RootState) => state.analytics.vendorDashboard;

// Loading & Error
export const selectAnalyticsLoading = (state: RootState) => state.analytics.isLoading;
export const selectAnalyticsError = (state: RootState) => state.analytics.error;