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
  const fetchMy = useCallback((params?: { page?: number; limit?: number; sortBy?: string; sortType?: string }) =>
    dispatch(fetchMyOrders(params)), [dispatch]);

  const fetchById = useCallback((orderId: string) => dispatch(fetchOrderById(orderId)), [dispatch]);

  const fetchAvailable = useCallback((orderId: string) => dispatch(fetchAvailableCoupons(orderId)), [dispatch]);

  const applyCoupon = useCallback((orderId: string, body: ApplyCouponRequest) =>
    dispatch(applyCouponToOrder({ orderId, body })), [dispatch]);

  const removeCoupon = useCallback((orderId: string) => dispatch(removeCouponFromOrder(orderId)), [dispatch]);

  const checkout = useCallback((orderId: string, body: CheckoutOrderRequest) =>
    dispatch(checkoutOrder({ orderId, body })), [dispatch]);

  const cancel = useCallback((orderId: string) => dispatch(cancelOrder(orderId)), [dispatch]);

  const confirmDelivered = useCallback((orderId: string) => dispatch(confirmDelivery(orderId)), [dispatch]);

  const fetchShop = useCallback((params?: { page?: number; limit?: number; sortBy?: string; sortType?: string }) =>
    dispatch(fetchShopOrders(params)), [dispatch]);

  const fetchShopByStatus = useCallback((status: OrderStatus, params?: { page?: number; limit?: number; sortBy?: string; sortType?: string }) =>
    dispatch(fetchShopOrdersByStatus({ status, params })), [dispatch]);

  const confirmOrder = useCallback((orderId: string) => dispatch(vendorConfirmOrder(orderId)), [dispatch]);

  const shipOrder = useCallback((orderId: string) => dispatch(vendorShipOrder(orderId)), [dispatch]);

  const fetchAdmin = useCallback((params?: {
    userId?: string;
    vendorId?: string;
    status?: OrderStatus;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortType?: string;
  }) => dispatch(fetchAdminOrders(params)), [dispatch]);

  const clearSelected = useCallback(() => dispatch(clearSelectedOrder()), [dispatch]);
  const clearCoupons = useCallback(() => dispatch(clearAvailableCoupons()), [dispatch]);

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
    fetchMyOrders: fetchMy,
    fetchOrderById: fetchById,
    fetchAvailableCoupons: fetchAvailable,
    applyCouponToOrder: applyCoupon,
    removeCouponFromOrder: removeCoupon,
    checkoutOrder: checkout,
    cancelOrder: cancel,
    confirmDelivery: confirmDelivered,

    // actions - vendor
    fetchShopOrders: fetchShop,
    fetchShopOrdersByStatus: fetchShopByStatus,
    vendorConfirmOrder: confirmOrder,
    vendorShipOrder: shipOrder,

    // actions - admin
    fetchAdminOrders: fetchAdmin,

    // utils
    clearSelectedOrder: clearSelected,
    clearAvailableCoupons: clearCoupons,
  };
};

export default useOrder;