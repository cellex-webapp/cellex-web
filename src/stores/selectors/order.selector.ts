import type { RootState } from '@/stores/store';

export const selectOrderLoading = (state: RootState) => state.order.isLoading;
export const selectOrderError = (state: RootState) => state.order.error;

export const selectMyOrders = (state: RootState) => state.order.myOrders;
export const selectShopOrders = (state: RootState) => state.order.shopOrders;
export const selectAdminOrders = (state: RootState) => state.order.adminOrders;
export const selectSelectedOrder = (state: RootState) => state.order.selectedOrder;
export const selectAvailableCoupons = (state: RootState) => Array.isArray(state.order.availableCoupons) ? state.order.availableCoupons : [];
export const selectOrderPaymentUrl = (state: RootState) => state.order.paymentUrl;

export const selectMyOrderPageMeta = (state: RootState) => {
	const p = state.order.myOrders as any;
	return {
		currentPage: p?.page ?? p?.currentPage ?? 1,
		pageSize: p?.limit ?? p?.pageSize ?? 10,
		totalElements: p?.totalElements ?? p?.total ?? 0,
	};
};

export const selectShopOrderPageMeta = (state: RootState) => {
	const p = state.order.shopOrders as any;
	return {
		currentPage: p?.page ?? p?.currentPage ?? 1,
		pageSize: p?.limit ?? p?.pageSize ?? 10,
		totalElements: p?.totalElements ?? p?.total ?? 0,
	};
};

export const selectAdminOrderPageMeta = (state: RootState) => {
	const p = state.order.adminOrders as any;
	return {
		currentPage: p?.page ?? p?.currentPage ?? 1,
		pageSize: p?.limit ?? p?.pageSize ?? 10,
		totalElements: p?.totalElements ?? p?.total ?? 0,
	};
};
