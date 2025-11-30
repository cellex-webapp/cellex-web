import axiosInstance from '@/utils/axiosInstance';

export const orderService = {
  // USER
  getMyOrders: async (params?: { page?: number; limit?: number; sortBy?: string; sortType?: string }): Promise<IApiResponse<IPage<IOrder>>> => {
    const resp = await axiosInstance.get<IApiResponse<IPage<IOrder>>>('/orders', { params });
    return resp.data;
  },
  getOrderById: async (orderId: string): Promise<IApiResponse<IOrder>> => {
    const resp = await axiosInstance.get<IApiResponse<IOrder>>(`/orders/${orderId}`);
    return resp.data;
  },
  createOrderFromProduct: async (body: CreateOrderRequest): Promise<IApiResponse<IOrder>> => {
    const resp = await axiosInstance.post<IApiResponse<IOrder>>('/orders/from-product', body);
    return resp.data;
  },
  createOrderFromCart: async (body: CreateOrderRequest): Promise<IApiResponse<IOrder>> => {
    const resp = await axiosInstance.post<IApiResponse<IOrder>>('/orders/from-cart', body);
    return resp.data;
  },
  getAvailableCoupons: async (orderId: string): Promise<IApiResponse<AvailableCouponResponse[]>> => {
    const resp = await axiosInstance.get<IApiResponse<AvailableCouponResponse[]>>(`/orders/${orderId}/coupons/available`);
    return resp.data;
  },
  applyCoupon: async (orderId: string, body: ApplyCouponRequest): Promise<IApiResponse<IOrder>> => {
    const resp = await axiosInstance.post<IApiResponse<IOrder>>(`/orders/${orderId}/coupons/apply`, body);
    return resp.data;
  },
  removeCoupon: async (orderId: string): Promise<IApiResponse<IOrder>> => {
    const resp = await axiosInstance.delete<IApiResponse<IOrder>>(`/orders/${orderId}/coupons`);
    return resp.data;
  },
  checkoutOrder: async (orderId: string, body: CheckoutOrderRequest): Promise<IApiResponse<IOrder>> => {
    const resp = await axiosInstance.post<IApiResponse<IOrder>>(`/orders/${orderId}/checkout`, body);
    return resp.data;
  },
  cancelOrder: async (orderId: string): Promise<IApiResponse<IOrder>> => {
    const resp = await axiosInstance.post<IApiResponse<IOrder>>(`/orders/${orderId}/cancel`);
    return resp.data;
  },
  confirmDelivery: async (orderId: string): Promise<IApiResponse<IOrder>> => {
    const resp = await axiosInstance.post<IApiResponse<IOrder>>(`/orders/${orderId}/confirm-delivery`);
    return resp.data;
  },

  // VENDOR
  getShopOrders: async (params?: { page?: number; limit?: number; sortBy?: string; sortType?: string }): Promise<IApiResponse<IPage<IOrder>>> => {
    const resp = await axiosInstance.get<IApiResponse<IPage<IOrder>>>('/orders/shop/orders', { params });
    return resp.data;
  },
  getShopOrdersByStatus: async (
    status: OrderStatus,
    params?: { page?: number; limit?: number; sortBy?: string; sortType?: string }
  ): Promise<IApiResponse<IPage<IOrder>>> => {
    const resp = await axiosInstance.get<IApiResponse<IPage<IOrder>>>(`/orders/shop/orders/by-status/${status}`, { params });
    return resp.data;
  },
  confirmOrder: async (orderId: string): Promise<IApiResponse<IOrder>> => {
    const resp = await axiosInstance.post<IApiResponse<IOrder>>(`/orders/${orderId}/confirm`);
    return resp.data;
  },
  shipOrder: async (orderId: string): Promise<IApiResponse<IOrder>> => {
    const resp = await axiosInstance.post<IApiResponse<IOrder>>(`/orders/${orderId}/ship`);
    return resp.data;
  },

  // ADMIN
  getAllOrdersForAdmin: async (params?: {
    userId?: string;
    vendorId?: string;
    status?: OrderStatus;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortType?: string;
  }): Promise<IApiResponse<IPage<IOrder>>> => {
    const resp = await axiosInstance.get<IApiResponse<IPage<IOrder>>>('/orders/admin/all', { params });
    return resp.data;
  },
};

export default orderService;