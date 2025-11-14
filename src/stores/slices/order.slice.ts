import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import orderService from '@/services/order.service';

const initialState: IOrderState = {
  myOrders: null,
  shopOrders: null,
  adminOrders: null,
  selectedOrder: null,
  availableCoupons: [],
  isLoading: false,
  error: null,
};

// USER
export const fetchMyOrders = createAsyncThunk(
  'order/fetchMyOrders',
  async (params?: { page?: number; limit?: number; sortBy?: string; sortType?: string }) => {
    const res = await orderService.getMyOrders(params);
    return res.result;
  }
);

export const fetchOrderById = createAsyncThunk('order/fetchById', async (orderId: string) => {
  const res = await orderService.getOrderById(orderId);
  return res.result;
});

export const fetchAvailableCoupons = createAsyncThunk(
  'order/fetchAvailableCoupons',
  async (orderId: string) => {
    const res = await orderService.getAvailableCoupons(orderId);
    return res.result;
  }
);

export const applyCouponToOrder = createAsyncThunk(
  'order/applyCoupon',
  async (payload: { orderId: string; body: ApplyCouponRequest }) => {
    const res = await orderService.applyCoupon(payload.orderId, payload.body);
    return res.result;
  }
);

export const removeCouponFromOrder = createAsyncThunk('order/removeCoupon', async (orderId: string) => {
  const res = await orderService.removeCoupon(orderId);
  return res.result;
});

export const checkoutOrder = createAsyncThunk(
  'order/checkout',
  async (payload: { orderId: string; body: CheckoutOrderRequest }) => {
    const res = await orderService.checkoutOrder(payload.orderId, payload.body);
    return res.result;
  }
);

export const cancelOrder = createAsyncThunk('order/cancel', async (orderId: string) => {
  const res = await orderService.cancelOrder(orderId);
  return res.result;
});

export const confirmDelivery = createAsyncThunk('order/confirmDelivery', async (orderId: string) => {
  const res = await orderService.confirmDelivery(orderId);
  return res.result;
});

// VENDOR
export const fetchShopOrders = createAsyncThunk(
  'order/fetchShopOrders',
  async (params?: { page?: number; limit?: number; sortBy?: string; sortType?: string }) => {
    const res = await orderService.getShopOrders(params);
    return res.result;
  }
);

export const fetchShopOrdersByStatus = createAsyncThunk(
  'order/fetchShopOrdersByStatus',
  async (payload: { status: OrderStatus; params?: { page?: number; limit?: number; sortBy?: string; sortType?: string } }) => {
    const res = await orderService.getShopOrdersByStatus(payload.status, payload.params);
    return res.result;
  }
);

export const vendorConfirmOrder = createAsyncThunk('order/confirmOrder', async (orderId: string) => {
  const res = await orderService.confirmOrder(orderId);
  return res.result;
});

export const vendorShipOrder = createAsyncThunk('order/shipOrder', async (orderId: string) => {
  const res = await orderService.shipOrder(orderId);
  return res.result;
});

// ADMIN
export const fetchAdminOrders = createAsyncThunk(
  'order/fetchAdminOrders',
  async (params?: {
    userId?: string;
    vendorId?: string;
    status?: OrderStatus;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortType?: string;
  }) => {
    const res = await orderService.getAllOrdersForAdmin(params);
    return res.result;
  }
);

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    clearSelectedOrder(state) {
      state.selectedOrder = null;
    },
    clearAvailableCoupons(state) {
      state.availableCoupons = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fulfilled mappings
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myOrders = action.payload;
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedOrder = action.payload;
      })
      .addCase(fetchAvailableCoupons.fulfilled, (state, action) => {
        state.isLoading = false;
        state.availableCoupons = action.payload || [];
      })
      .addCase(applyCouponToOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedOrder = action.payload;
      })
      .addCase(removeCouponFromOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedOrder = action.payload;
      })
      .addCase(checkoutOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedOrder = action.payload;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedOrder = action.payload;
      })
      .addCase(confirmDelivery.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedOrder = action.payload;
      })
      .addCase(fetchShopOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.shopOrders = action.payload;
      })
      .addCase(fetchShopOrdersByStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.shopOrders = action.payload;
      })
      .addCase(vendorConfirmOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedOrder = action.payload;
      })
      .addCase(vendorShipOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedOrder = action.payload;
      })
      .addCase(fetchAdminOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.adminOrders = action.payload;
      })
      // Loading (place after addCase due to RTK type order constraints)
      .addMatcher(
        (action) => action.type.startsWith('order/') && action.type.endsWith('/pending'),
        (state) => {
          state.isLoading = true;
          state.error = null;
        }
      )
      // Rejected
      .addMatcher(
        (action) => action.type.startsWith('order/') && action.type.endsWith('/rejected'),
        (state, action: any) => {
          state.isLoading = false;
          state.error = action.error?.message || 'Something went wrong';
        }
      );
  },
});

export const { clearSelectedOrder, clearAvailableCoupons } = orderSlice.actions;

export default orderSlice.reducer;