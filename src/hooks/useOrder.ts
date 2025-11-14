import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { useCallback } from 'react';
import {
  fetchMyOrders,
  fetchOrderById,
  fetchAvailableCoupons,
  applyCouponToOrder,
  removeCouponFromOrder,
  checkoutOrder,
  cancelOrder,
  confirmDelivery,
  fetchShopOrders,
  fetchShopOrdersByStatus,
  vendorConfirmOrder,
  vendorShipOrder,
  fetchAdminOrders,
  clearSelectedOrder,
  clearAvailableCoupons,
} from '@/stores/slices/order.slice';
import {
  selectAdminOrders,
  selectAvailableCoupons,
  selectMyOrders,
  selectOrderError,
  selectOrderLoading,
  selectSelectedOrder,
  selectShopOrders,
} from '@/stores/selectors/order.selector';

export const useOrder = () => {
  const dispatch = useAppDispatch();

  const isLoading = useAppSelector(selectOrderLoading);
  const error = useAppSelector(selectOrderError);
  const myOrders = useAppSelector(selectMyOrders);
  const shopOrders = useAppSelector(selectShopOrders);
  const adminOrders = useAppSelector(selectAdminOrders);
  const selectedOrder = useAppSelector(selectSelectedOrder);
  const availableCoupons = useAppSelector(selectAvailableCoupons);

  // Stable action creators to avoid effect loops in consumers
  const _fetchMyOrders = useCallback((params?: { page?: number; limit?: number; sortBy?: string; sortType?: string }) =>
    dispatch(fetchMyOrders(params)), [dispatch]);

  const _fetchOrderById = useCallback((orderId: string) => dispatch(fetchOrderById(orderId)), [dispatch]);

  const _fetchAvailableCoupons = useCallback((orderId: string) => dispatch(fetchAvailableCoupons(orderId)), [dispatch]);

  const _applyCouponToOrder = useCallback((orderId: string, body: ApplyCouponRequest) =>
    dispatch(applyCouponToOrder({ orderId, body })), [dispatch]);

  const _removeCouponFromOrder = useCallback((orderId: string) => dispatch(removeCouponFromOrder(orderId)), [dispatch]);

  const _checkoutOrder = useCallback((orderId: string, body: CheckoutOrderRequest) =>
    dispatch(checkoutOrder({ orderId, body })), [dispatch]);

  const _cancelOrder = useCallback((orderId: string) => dispatch(cancelOrder(orderId)), [dispatch]);

  const _confirmDelivery = useCallback((orderId: string) => dispatch(confirmDelivery(orderId)), [dispatch]);

  const _fetchShopOrders = useCallback((params?: { page?: number; limit?: number; sortBy?: string; sortType?: string }) =>
    dispatch(fetchShopOrders(params)), [dispatch]);

  const _fetchShopOrdersByStatus = useCallback((status: OrderStatus, params?: { page?: number; limit?: number; sortBy?: string; sortType?: string }) =>
    dispatch(fetchShopOrdersByStatus({ status, params })), [dispatch]);

  const _vendorConfirmOrder = useCallback((orderId: string) => dispatch(vendorConfirmOrder(orderId)), [dispatch]);

  const _vendorShipOrder = useCallback((orderId: string) => dispatch(vendorShipOrder(orderId)), [dispatch]);

  const _fetchAdminOrders = useCallback((params?: {
    userId?: string;
    vendorId?: string;
    status?: OrderStatus;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortType?: string;
  }) => dispatch(fetchAdminOrders(params)), [dispatch]);

  const _clearSelectedOrder = useCallback(() => dispatch(clearSelectedOrder()), [dispatch]);
  const _clearAvailableCoupons = useCallback(() => dispatch(clearAvailableCoupons()), [dispatch]);

  return {
    // state
    isLoading,
    error,
    myOrders,
    shopOrders,
    adminOrders,
    selectedOrder,
    availableCoupons,

    // actions - user
    fetchMyOrders: _fetchMyOrders,
    fetchOrderById: _fetchOrderById,
    fetchAvailableCoupons: _fetchAvailableCoupons,
    applyCouponToOrder: _applyCouponToOrder,
    removeCouponFromOrder: _removeCouponFromOrder,
    checkoutOrder: _checkoutOrder,
    cancelOrder: _cancelOrder,
    confirmDelivery: _confirmDelivery,

    // actions - vendor
    fetchShopOrders: _fetchShopOrders,
    fetchShopOrdersByStatus: _fetchShopOrdersByStatus,
    vendorConfirmOrder: _vendorConfirmOrder,
    vendorShipOrder: _vendorShipOrder,

    // actions - admin
    fetchAdminOrders: _fetchAdminOrders,

    // utils
    clearSelectedOrder: _clearSelectedOrder,
    clearAvailableCoupons: _clearAvailableCoupons,
  };
};

export default useOrder;