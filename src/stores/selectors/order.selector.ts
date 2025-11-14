import type { RootState } from '@/stores/store';

export const selectOrderLoading = (state: RootState) => state.order.isLoading;
export const selectOrderError = (state: RootState) => state.order.error;

export const selectMyOrders = (state: RootState) => state.order.myOrders;
export const selectShopOrders = (state: RootState) => state.order.shopOrders;
export const selectAdminOrders = (state: RootState) => state.order.adminOrders;
export const selectSelectedOrder = (state: RootState) => state.order.selectedOrder;
export const selectAvailableCoupons = (state: RootState) => state.order.availableCoupons;
