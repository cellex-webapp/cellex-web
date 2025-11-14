import axiosInstance from '@/utils/axiosInstance';

export const orderService = {
  // USER
  getMyOrders: async (params?: { page?: number; limit?: number; sortBy?: string; sortType?: string }): Promise<IApiResponse<IPage<IOrder>>> => {
    const resp = await axiosInstance.get<IApiResponse<IPage<IOrder>>>('/orders', { params });
    return (resp as unknown) as IApiResponse<IPage<IOrder>>;
  },
  getOrderById: async (orderId: string): Promise<IApiResponse<IOrder>> => {
    const resp = await axiosInstance.get<IApiResponse<IOrder>>(`/orders/${orderId}`);
    return (resp as unknown) as IApiResponse<IOrder>;
  },
  createOrderFromProduct: async (body: CreateOrderRequest): Promise<IApiResponse<IOrder>> => {
    const resp = await axiosInstance.post<IApiResponse<IOrder>>('/orders/from-product', body);
    return (resp as unknown) as IApiResponse<IOrder>;
  },
  createOrderFromCart: async (body: CreateOrderRequest): Promise<IApiResponse<IOrder>> => {
    const resp = await axiosInstance.post<IApiResponse<IOrder>>('/orders/from-cart', body);
    return (resp as unknown) as IApiResponse<IOrder>;
  },
  getAvailableCoupons: async (orderId: string): Promise<IApiResponse<AvailableCouponResponse[]>> => {
    const resp = await axiosInstance.get<IApiResponse<AvailableCouponResponse[]>>(`/orders/${orderId}/coupons/available`);
    return (resp as unknown) as IApiResponse<AvailableCouponResponse[]>;
  },
  applyCoupon: async (orderId: string, body: ApplyCouponRequest): Promise<IApiResponse<IOrder>> => {
    const resp = await axiosInstance.post<IApiResponse<IOrder>>(`/orders/${orderId}/coupons/apply`, body);
    return (resp as unknown) as IApiResponse<IOrder>;
  },
  removeCoupon: async (orderId: string): Promise<IApiResponse<IOrder>> => {
    const resp = await axiosInstance.delete<IApiResponse<IOrder>>(`/orders/${orderId}/coupons`);
    return (resp as unknown) as IApiResponse<IOrder>;
  },
  checkoutOrder: async (orderId: string, body: CheckoutOrderRequest): Promise<IApiResponse<IOrder>> => {
    const resp = await axiosInstance.post<IApiResponse<IOrder>>(`/orders/${orderId}/checkout`, body);
    return (resp as unknown) as IApiResponse<IOrder>;
  },
  cancelOrder: async (orderId: string): Promise<IApiResponse<IOrder>> => {
    const resp = await axiosInstance.post<IApiResponse<IOrder>>(`/orders/${orderId}/cancel`);
    return (resp as unknown) as IApiResponse<IOrder>;
  },
  confirmDelivery: async (orderId: string): Promise<IApiResponse<IOrder>> => {
    const resp = await axiosInstance.post<IApiResponse<IOrder>>(`/orders/${orderId}/confirm-delivery`);
    return (resp as unknown) as IApiResponse<IOrder>;
  },

  // VENDOR
  getShopOrders: async (params?: { page?: number; limit?: number; sortBy?: string; sortType?: string }): Promise<IApiResponse<IPage<IOrder>>> => {
    const resp = await axiosInstance.get<IApiResponse<IPage<IOrder>>>('/orders/shop/orders', { params });
    return (resp as unknown) as IApiResponse<IPage<IOrder>>;
  },
  getShopOrdersByStatus: async (
    status: OrderStatus,
    params?: { page?: number; limit?: number; sortBy?: string; sortType?: string }
  ): Promise<IApiResponse<IPage<IOrder>>> => {
    const resp = await axiosInstance.get<IApiResponse<IPage<IOrder>>>(`/orders/shop/orders/by-status/${status}`, { params });
    return (resp as unknown) as IApiResponse<IPage<IOrder>>;
  },
  confirmOrder: async (orderId: string): Promise<IApiResponse<IOrder>> => {
    const resp = await axiosInstance.post<IApiResponse<IOrder>>(`/orders/${orderId}/confirm`);
    return (resp as unknown) as IApiResponse<IOrder>;
  },
  shipOrder: async (orderId: string): Promise<IApiResponse<IOrder>> => {
    const resp = await axiosInstance.post<IApiResponse<IOrder>>(`/orders/${orderId}/ship`);
    return (resp as unknown) as IApiResponse<IOrder>;
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
    return (resp as unknown) as IApiResponse<IPage<IOrder>>;
  },
};

export default orderService;